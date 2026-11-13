'use server';

import { RequestStatus } from '@/generated/prisma/client';
import { prisma } from '@/lib/prisma/client';
import { getCurrentMember } from '@/lib/auth/member';

export async function getSitterRequests() {
  try {
    const requests = await prisma.sitterRequest.findMany({
      where: { status: { not: RequestStatus.HIDDEN } },
      orderBy: { createdAt: 'desc' },
      include: {
        pet: {
          select: { id: true, name: true, breed: true, imageUrl: true },
        },
        author: {
          select: { id: true, name: true },
        },
        applications: {
          select: { id: true },
        },
      },
    });
    return { success: true, data: requests };
  } catch (error) {
    console.error('Failed to fetch sitter requests:', error);
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