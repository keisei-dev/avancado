'use server';

import { prisma } from '@/lib/prisma/client';

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

    if (!request) {
      return { success: false, error: 'Sitter request not found.' };
    }

    return { success: true, data: request };
  } catch (error) {
    console.error('Failed to fetch sitter request detail:', error);
    return { success: false, error: 'Failed to fetch sitter request detail.' };
  }
}