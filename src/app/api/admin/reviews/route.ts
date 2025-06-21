import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).userType !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            provider: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                serviceType: true,
              },
            },
          },
        },
        booking: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
} 