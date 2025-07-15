import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { saveFile } from '@/lib/upload';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: {
            provider: true
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify provider permission
    const provider = await prisma.serviceProvider.findUnique({
      where: { email: session.user.email }
    });

    if (!provider || booking.service.providerId !== provider.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Verify booking is in IN_PROGRESS status
    if (booking.status !== 'IN_PROGRESS') {
      return NextResponse.json({ 
        error: 'Can only upload completion evidence for in-progress bookings' 
      }, { status: 400 });
    }

    // Handle image upload
    const formData = await request.formData();
    const image = formData.get('image') as File | null;

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Save the image
    const imageUrl = await saveFile(image);

    // Update booking with completion image and status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        completionImage: imageUrl,
        status: 'COMPLETED'
      },
      include: {
        service: {
          include: {
            provider: true
          }
        },
        customer: true
      }
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Error uploading completion evidence:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}