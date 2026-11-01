'use server';

import { prisma } from '@/lib/prisma/client';

export async function getSitterRequests() {
  try {
    const requests = await prisma.sitterRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pet: true,
        author: true,
        applications: true,
      },
    });
    return { success: true, data: requests };
  } catch (error) {
    console.error('Failed to fetch sitter requests:', error);
    return { success: false, error: 'Failed to fetch sitter requests.' };
  }
}