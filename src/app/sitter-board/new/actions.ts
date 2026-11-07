'use server';

import { prisma } from '@/lib/prisma/client';
import { revalidatePath } from 'next/cache';

export async function createSitterRequest(formData: {
  authorId: string;
  petId: string;
  title: string;
  description: string;
  areaName: string;
  startAt: string | Date;
  endAt: string | Date;
  durationMinutes: number;
}) {
  try {
    const { authorId, petId, title, description, areaName, startAt, endAt, durationMinutes } = formData;

    if (!authorId || !petId || !title || !startAt || !endAt) {
      return { success: false, error: 'Missing required fields.' };
    }

    const newRequest = await prisma.sitterRequest.create({
      data: {
        authorId,
        petId,
        title,
        description: description || '',
        areaName: areaName || '',
        startAt: new Date(startAt),
        endAt: new Date(endAt),
        durationMinutes: Number(durationMinutes) || 0,
      },
    });

    revalidatePath('/sitter-board');
    return { success: true, data: newRequest };
  } catch (error) {
    console.error('Failed to create sitter request:', error);
    return { success: false, error: 'Failed to create sitter request.' };
  }
}