import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch reviews for provider's services
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { email: session.user.email }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get all reviews for this provider's services
    const reviews = await prisma.review.findMany({
      where: {
        service: {
          providerId: provider.id
        }
      },
      include: {
        customer: {
          select: {
            name: true,
            username: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        booking: {
          select: {
            id: true,
            scheduledDate: true,
            customerName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching provider reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add provider comment to a review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId, providerComment } = body;

    // Validate required fields
    if (!reviewId || !providerComment?.trim()) {
      return NextResponse.json({ error: 'Review ID and comment are required' }, { status: 400 });
    }

    // Get the provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { email: session.user.email }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get the review and verify it belongs to this provider's service
    const review = await prisma.review.findUnique({
      where: { id: parseInt(reviewId) },
      include: {
        service: true
      }
    });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.service.providerId !== provider.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the review with provider comment
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(reviewId) },
      data: {
        providerComment: providerComment.trim()
      },
      include: {
        customer: {
          select: {
            name: true,
            username: true
          }
        },
        service: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        booking: {
          select: {
            id: true,
            scheduledDate: true,
            customerName: true
          }
        }
      }
    });

    return NextResponse.json({ review: updatedReview }, { status: 200 });
  } catch (error) {
    console.error('Error adding provider comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 