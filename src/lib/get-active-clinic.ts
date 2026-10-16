import { prisma } from './prisma';
import { cookies } from 'next/headers';

export async function getActiveClinic(searchParams?: { clinicId?: string } | Record<string, string | string[] | undefined>) {
  try {
    const queryId = typeof searchParams?.clinicId === 'string' ? searchParams.clinicId : undefined;
    const cookieStore = cookies();
    const cookieId = cookieStore.get('clinicId')?.value;
    const targetId = queryId || cookieId;

    if (targetId) {
      const clinic = await prisma.clinic.findUnique({
        where: { id: targetId },
      });
      if (clinic) return clinic;
    }

    return await prisma.clinic.findFirst();
  } catch (error) {
    console.warn('Could not retrieve active clinic from database:', error);
    return null;
  }
}
