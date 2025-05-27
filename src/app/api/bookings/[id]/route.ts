import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch a specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: {
            provider: true
          }
        },
        customer: true
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has access to this booking
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const provider = await prisma.serviceProvider.findUnique({
      where: { email: session.user.email }
    });

    const hasAccess = 
      (user && booking.customerId === user.id) ||
      (provider && booking.service.providerId === provider.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH - Update booking status or details
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    const body = await request.json();
    const { status, notes } = body;

    // Get the booking first
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          include: {
            provider: true
          }
        }
      }
    });

    if (!existingBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user has permission to update this booking
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const provider = await prisma.serviceProvider.findUnique({
      where: { email: session.user.email }
    });

    const isCustomer = user && existingBooking.customerId === user.id;
    const isProvider = provider && existingBooking.service.providerId === provider.id;

    if (!isCustomer && !isProvider) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Validate status transitions
    const validStatusTransitions: Record<string, string[]> = {
      'PENDING': ['CONFIRMED', 'REJECTED', 'CANCELLED'],
      'CONFIRMED': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': [],
      'REJECTED': []
    };

    if (status && !validStatusTransitions[existingBooking.status]?.includes(status)) {
      return NextResponse.json({ 
        error: `Cannot change status from ${existingBooking.status} to ${status}` 
      }, { status: 400 });
    }

    // Only providers can confirm, reject, or mark as in progress/completed
    // Only customers can cancel pending bookings
    if (status) {
      if (['CONFIRMED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED'].includes(status) && !isProvider) {
        return NextResponse.json({ error: 'Only service providers can update to this status' }, { status: 403 });
      }
      
      if (status === 'CANCELLED' && !isCustomer && !isProvider) {
        return NextResponse.json({ error: 'Only customers or providers can cancel bookings' }, { status: 403 });
      }
    }

    // Update the booking
    const updateData: any = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
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
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Cancel/Delete a booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = parseInt(params.id);
    
    // Get the booking first
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

    // Check permissions
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const provider = await prisma.serviceProvider.findUnique({
      where: { email: session.user.email }
    });

    const hasAccess = 
      (user && booking.customerId === user.id) ||
      (provider && booking.service.providerId === provider.id);

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only allow deletion of pending or cancelled bookings
    if (!['PENDING', 'CANCELLED', 'REJECTED'].includes(booking.status)) {
      return NextResponse.json({ 
        error: 'Can only delete pending, cancelled, or rejected bookings' 
      }, { status: 400 });
    }

    await prisma.booking.delete({
      where: { id: bookingId }
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 