'use server';

import { RequestStatus } from '@/generated/prisma/client';
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