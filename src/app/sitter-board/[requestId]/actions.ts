'use server';

import { RequestStatus } from '@/generated/prisma/client';
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

export async function deleteSitterRequest(requestId: string) {
  try {
    if (!requestId) {
      return { success: false, error: 'Missing request ID.' };
    }

    await prisma.sitterRequest.delete({
      where: { id: requestId },
    });

    revalidatePath('/sitter-board');
    revalidatePath('/sitter-board/my-requests');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete sitter request:', error);
    return { success: false, error: 'Failed to delete sitter request.' };
  }
}