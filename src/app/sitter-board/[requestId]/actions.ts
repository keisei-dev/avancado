'use server';

import { ApplyStatus, RequestStatus } from '@/generated/prisma/client';
import { assertNotAdmin } from '@/lib/auth/admin';
import { getCurrentMember } from '@/lib/auth/member';
import { createNotification } from '@/lib/notifications/create';
import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';

export async function getSitterRequestDetail(requestId: string) {
  try {
    const request = await prisma.sitterRequest.findUnique({
      where: { id: requestId },
      include: {
        pet: true,
        author: true,
        applications: {
          orderBy: { createdAt: 'asc' },
          include: {
            applicant: true,
          },
        },
      },
    });

    if (!request || request.status === RequestStatus.HIDDEN) {
      return { success: false, error: 'Sitter request not found.' };
    }

    return { success: true, data: request };
  } catch (error) {
    console.error('Failed to fetch sitter request detail:', error);
    return { success: false, error: 'Failed to fetch sitter request detail.' };
  }
}

// Loads a request only if the current member wrote it
async function getMyRequest(requestId: string) {
  const blocked = await assertNotAdmin();
  if (blocked) return { error: blocked };

  const member = await getCurrentMember();
  if (!member) return { error: 'Please log in.' };

  const request = await prisma.sitterRequest.findUnique({
    where: { id: requestId },
    select: {
      id: true,
      authorId: true,
      status: true,
      pet: { select: { name: true } },
      applications: { select: { id: true, applicantId: true, status: true } },
    },
  });
  if (!request || request.status === RequestStatus.HIDDEN) {
    return { error: 'This request could not be found.' };
  }
  if (request.authorId !== member.id) return { error: 'This is not your request.' };

  return { member, request };
}

function refresh(requestId: string) {
  revalidatePath(`/sitter-board/${requestId}`);
  revalidatePath('/sitter-board');
}

export async function selectSitter(requestId: string, applicationId: string) {
  try {
    const found = await getMyRequest(requestId);
    if (!found.request) return { success: false, error: found.error };
    const { member, request } = found;

    if (request.status !== RequestStatus.OPEN) {
      return { success: false, error: 'This request is no longer open.' };
    }
    const chosen = request.applications.find((a) => a.id === applicationId);
    if (!chosen || chosen.status !== ApplyStatus.PENDING) {
      return { success: false, error: 'This applicant can no longer be selected.' };
    }

    // updateMany with status OPEN stops two picks from both going through
    const matched = await prisma.$transaction(async (tx) => {
      const moved = await tx.sitterRequest.updateMany({
        where: { id: request.id, status: RequestStatus.OPEN },
        data: { status: RequestStatus.MATCHED },
      });
      if (moved.count === 0) return false;
      await tx.sitterApply.update({
        where: { id: chosen.id },
        data: { status: ApplyStatus.ACCEPTED },
      });
      return true;
    });
    if (!matched) return { success: false, error: 'This request is no longer open.' };

    const others = request.applications.filter(
      (a) => a.id !== chosen.id && a.status === ApplyStatus.PENDING,
    );
    await Promise.all([
      createNotification({
        userId: chosen.applicantId,
        type: 'APPLICATION_ACCEPTED',
        requestId: request.id,
        actorName: member.name,
        petName: request.pet.name,
      }),
      ...others.map((a) =>
        createNotification({
          userId: a.applicantId,
          type: 'APPLICATION_REJECTED',
          requestId: request.id,
          actorName: member.name,
          petName: request.pet.name,
        }),
      ),
    ]);

    refresh(request.id);
    return { success: true };
  } catch (error) {
    console.error('Failed to select sitter:', error);
    return { success: false, error: 'Failed to select this sitter.' };
  }
}

export async function cancelMatch(requestId: string) {
  try {
    const found = await getMyRequest(requestId);
    if (!found.request) return { success: false, error: found.error };
    const { member, request } = found;

    const accepted = request.applications.find((a) => a.status === ApplyStatus.ACCEPTED);
    if (request.status !== RequestStatus.MATCHED || !accepted) {
      return { success: false, error: 'This request is not matched.' };
    }

    // Only the cancelled sitter stays blocked; others can be picked again
    const reopened = await prisma.$transaction(async (tx) => {
      const moved = await tx.sitterRequest.updateMany({
        where: { id: request.id, status: RequestStatus.MATCHED },
        data: { status: RequestStatus.OPEN },
      });
      if (moved.count === 0) return false;
      await tx.sitterApply.updateMany({
        where: { requestId: request.id, status: ApplyStatus.REJECTED },
        data: { status: ApplyStatus.PENDING },
      });
      await tx.sitterApply.update({
        where: { id: accepted.id },
        data: { status: ApplyStatus.REJECTED },
      });
      return true;
    });
    if (!reopened) return { success: false, error: 'This request is not matched.' };

    await createNotification({
      userId: accepted.applicantId,
      type: 'MATCH_CANCELLED',
      requestId: request.id,
      actorName: member.name,
      petName: request.pet.name,
    });

    refresh(request.id);
    return { success: true };
  } catch (error) {
    console.error('Failed to cancel match:', error);
    return { success: false, error: 'Failed to cancel the match.' };
  }
}

// Marks a matched request as done and saves the owner's review of the sitter
export async function reviewSitter(input: { requestId: string; rating: number; comment: string }) {
  try {
    const found = await getMyRequest(input.requestId);
    if (!found.request) return { success: false, error: found.error };
    const { member, request } = found;

    if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
      return { success: false, error: 'Choose a rating from 1 to 5.' };
    }
    const comment = input.comment.trim();
    if (comment.length > 1000) {
      return { success: false, error: 'Keep your review under 1000 characters.' };
    }

    const accepted = request.applications.find((a) => a.status === ApplyStatus.ACCEPTED);
    if (
      !accepted ||
      (request.status !== RequestStatus.MATCHED && request.status !== RequestStatus.DONE)
    ) {
      return { success: false, error: 'There is no sitter to review yet.' };
    }

    const existing = await prisma.review.findUnique({
      where: { requestId_reviewerId: { requestId: request.id, reviewerId: member.id } },
      select: { id: true },
    });
    if (existing) return { success: false, error: "You've already reviewed this sitting." };

    const finishing = request.status === RequestStatus.MATCHED;
    await prisma.$transaction([
      ...(finishing
        ? [
            prisma.sitterRequest.update({
              where: { id: request.id },
              data: { status: RequestStatus.DONE },
            }),
          ]
        : []),
      prisma.review.create({
        data: {
          requestId: request.id,
          reviewerId: member.id,
          revieweeId: accepted.applicantId,
          rating: input.rating,
          comment,
        },
      }),
    ]);

    if (finishing) {
      await createNotification({
        userId: accepted.applicantId,
        type: 'REQUEST_COMPLETED',
        requestId: request.id,
        actorName: member.name,
        petName: request.pet.name,
      });
    }

    refresh(request.id);
    return { success: true, finished: finishing };
  } catch (error) {
    console.error('Failed to review sitter:', error);
    return { success: false, error: 'Failed to post your review.' };
  }
}

// Keeps the row as CANCELLED so applications, reviews and reports stay
export async function deleteSitterRequest(requestId: string) {
  try {
    const found = await getMyRequest(requestId);
    if (!found.request) return { success: false, error: found.error };
    const { member, request } = found;

    if (request.status === RequestStatus.CANCELLED) {
      return { success: false, error: 'This request was already deleted.' };
    }

    await prisma.sitterRequest.update({
      where: { id: request.id },
      data: { status: RequestStatus.CANCELLED },
    });

    const accepted = request.applications.find((a) => a.status === ApplyStatus.ACCEPTED);
    if (request.status === RequestStatus.MATCHED && accepted) {
      await createNotification({
        userId: accepted.applicantId,
        type: 'MATCH_CANCELLED',
        requestId: request.id,
        actorName: member.name,
        petName: request.pet.name,
      });
    }

    refresh(request.id);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete sitter request:', error);
    return { success: false, error: 'Failed to delete sitter request.' };
  }
}
