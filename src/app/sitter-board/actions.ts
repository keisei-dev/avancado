'use server';

import { ApplyStatus, RequestStatus } from '@/generated/prisma/client';
import { assertNotAdmin } from '@/lib/auth/admin';
import { createNotification } from '@/lib/notifications/create';
import { prisma } from '@/lib/prisma/client';
import { getCurrentMember } from '@/lib/auth/member';
import { revalidatePath } from 'next/cache';

const boardRequestInclude = {
  pet: {
    select: { id: true, name: true, breed: true, imageUrl: true, isVaccinated: true },
  },
  author: {
    select: { id: true, name: true },
  },
  applications: {
    select: { id: true, applicantId: true, status: true },
  },
} as const;

export async function getSitterBoard() {
  try {
    const member = await getCurrentMember();
    const visible = { status: { not: RequestStatus.HIDDEN } };

    const [all, mine, applied] = await Promise.all([
      prisma.sitterRequest.findMany({
        where: { status: RequestStatus.OPEN },
        orderBy: { createdAt: 'desc' },
        include: boardRequestInclude,
      }),
      member
        ? prisma.sitterRequest.findMany({
            where: { ...visible, authorId: member.id },
            orderBy: { createdAt: 'desc' },
            include: boardRequestInclude,
          })
        : [],
      member
        ? prisma.sitterRequest.findMany({
            where: { ...visible, applications: { some: { applicantId: member.id } } },
            orderBy: { createdAt: 'desc' },
            include: boardRequestInclude,
          })
        : [],
    ]);

    return {
      success: true,
      data: { memberId: member?.id ?? null, all, mine, applied },
    };
  } catch (error) {
    console.error('Failed to fetch sitter board:', error);
    return { success: false, error: 'Failed to fetch sitter requests.' };
  }
}

export async function getMyPetsForSitter() {
  try {
    const member = await getCurrentMember();
    if (!member) return { success: false, error: 'Please log in.' };

    const pets = await prisma.pet.findMany({
      where: { ownerId: member.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        breed: true,
        birthDate: true,
        imageUrl: true,
        isVaccinated: true,
      },
    });

    const now = Date.now();
    const data = pets.map((p) => ({
      id: p.id,
      name: p.name,
      breed: p.breed,
      age: p.birthDate
        ? Math.max(
            0,
            Math.floor((now - p.birthDate.getTime()) / (365.25 * 24 * 3600 * 1000)),
          )
        : null,
      imageUrl: p.imageUrl,
      vaccinated: p.isVaccinated,
    }));

    return { success: true, data };
  } catch (error) {
    console.error('Failed to fetch my pets:', error);
    return { success: false, error: 'Failed to fetch pets.' };
  }
}

export async function createSitterRequest(input: {
  petIds: string[];
  title: string;
  description: string;
  areaName: string;
  startAt: string;
  endAt: string;
}) {
  try {
    const member = await getCurrentMember();
    if (!member) return { success: false, error: 'Please log in.' };

    const title = input.title.trim();
    const description = input.description.trim();
    const areaName = input.areaName.trim();
    if (!title || !description || !areaName) {
      return { success: false, error: 'Please fill in all fields.' };
    }

    const startAt = new Date(input.startAt);
    const endAt = new Date(input.endAt);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      return { success: false, error: 'Invalid date or time.' };
    }
    if (endAt <= startAt) {
      return { success: false, error: 'End must be after the start.' };
    }

    const durationMinutes = Math.round((endAt.getTime() - startAt.getTime()) / 60000);
    if (durationMinutes > 30 * 24 * 60) {
      return { success: false, error: 'A request can be at most 30 days long.' };
    }

    if (input.petIds.length === 0) {
      return { success: false, error: 'Choose a pet.' };
    }
    const pet = await prisma.pet.findFirst({
      where: { id: input.petIds[0], ownerId: member.id, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!pet) return { success: false, error: 'Pet not found.' };

    await prisma.sitterRequest.create({
      data: {
        authorId: member.id,
        petId: pet.id,
        title,
        description,
        areaName,
        startAt,
        endAt,
        durationMinutes,
      },
    });

    revalidatePath('/sitter-board');
    return { success: true };
  } catch (error) {
    console.error('Failed to create sitter request:', error);
    return { success: false, error: 'Failed to create request.' };
  }
}

export async function applyToSitterRequest(input: {
  requestId: string;
  message: string;
  available: boolean;
}) {
  try {
    const blocked = await assertNotAdmin();
    if (blocked) return { success: false, error: blocked };

    const member = await getCurrentMember();
    if (!member) return { success: false, error: 'Please log in to apply.' };

    const message = input.message.trim();
    if (!message) return { success: false, error: 'Write a short message to the owner.' };
    if (message.length > 500) {
      return { success: false, error: 'Keep your message under 500 characters.' };
    }
    if (!input.available) {
      return { success: false, error: 'Please confirm you are available.' };
    }

    const request = await prisma.sitterRequest.findUnique({
      where: { id: input.requestId },
      select: { id: true, authorId: true, status: true, pet: { select: { name: true } } },
    });
    if (!request || request.status === RequestStatus.HIDDEN) {
      return { success: false, error: 'This request could not be found.' };
    }
    if (request.authorId === member.id) {
      return { success: false, error: "You can't apply to your own request." };
    }
    if (request.status !== RequestStatus.OPEN) {
      return { success: false, error: 'This request is no longer open.' };
    }

    const existing = await prisma.sitterApply.findUnique({
      where: { requestId_applicantId: { requestId: request.id, applicantId: member.id } },
      select: { id: true },
    });
    if (existing) return { success: false, error: "You've already applied to this request." };

    await prisma.sitterApply.create({
      data: { requestId: request.id, applicantId: member.id, message },
    });

    await createNotification({
      userId: request.authorId,
      type: 'APPLICATION_RECEIVED',
      requestId: request.id,
      actorName: member.name,
      petName: request.pet.name,
    });

    revalidatePath(`/sitter-board/${request.id}`);
    revalidatePath('/sitter-board');
    return { success: true };
  } catch (error) {
    console.error('Failed to apply to sitter request:', error);
    return { success: false, error: 'Failed to send your application.' };
  }
}

export async function withdrawApplication(requestId: string) {
  try {
    const member = await getCurrentMember();
    if (!member) return { success: false, error: 'Please log in.' };

    const application = await prisma.sitterApply.findUnique({
      where: { requestId_applicantId: { requestId, applicantId: member.id } },
      select: {
        id: true,
        status: true,
        request: { select: { authorId: true, pet: { select: { name: true } } } },
      },
    });
    if (!application) return { success: false, error: 'Application not found.' };
    if (application.status !== ApplyStatus.PENDING) {
      return { success: false, error: 'This application can no longer be withdrawn.' };
    }

    await prisma.sitterApply.delete({ where: { id: application.id } });

    await createNotification({
      userId: application.request.authorId,
      type: 'APPLICATION_WITHDRAWN',
      requestId,
      actorName: member.name,
      petName: application.request.pet.name,
    });

    revalidatePath(`/sitter-board/${requestId}`);
    revalidatePath('/sitter-board');
    return { success: true };
  } catch (error) {
    console.error('Failed to withdraw application:', error);
    return { success: false, error: 'Failed to withdraw your application.' };
  }
}
