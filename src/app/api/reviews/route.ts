import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// POST - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, rating, comment } = body;

    // Validate required fields
    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating or missing booking ID' }, { status: 400 });
    }

    // Get the customer
    const customer = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get the booking and verify it belongs to the customer and is completed
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: {
        service: true,
        review: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.customerId !== customer.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (booking.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'Can only review completed bookings' }, { status: 400 });
    }

    if (booking.review) {
      return NextResponse.json({ error: 'Booking already has a review' }, { status: 400 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId: parseInt(bookingId),
        serviceId: booking.serviceId,
        customerId: customer.id,
        rating: parseInt(rating),
        comment: comment || null
      },
      include: {
        booking: {
          include: {
            service: {
              include: {
                provider: true
              }
            }
          }
        },
        customer: true
      }
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET - Fetch reviews for a service
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: { serviceId: parseInt(serviceId) },
      include: {
        customer: {
          select: {
            name: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 