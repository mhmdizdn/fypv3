import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch bookings for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType') || 'customer';
    
    let bookings;
    
    if (userType === 'customer') {
      // Get customer's bookings
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      bookings = await prisma.booking.findMany({
        where: { customerId: user.id },
        include: {
          service: {
            include: {
              provider: true
            }
          },
          review: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (userType === 'provider') {
      // Get provider's bookings
      const provider = await prisma.serviceProvider.findUnique({
        where: { email: session.user.email },
        include: {
          services: {
            include: {
              bookings: {
                include: {
                  customer: true,
                  service: true
                }
              }
            }
          }
        }
      });
      
      if (!provider) {
        return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
      }

      // Flatten bookings from all services
      bookings = provider.services.flatMap(service => service.bookings);
      bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      scheduledDate,
      scheduledTime,
      notes
    } = body;

    // Validate required fields
    if (!serviceId || !customerName || !customerEmail || !customerPhone || !customerAddress || !scheduledDate || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the customer
    const customer = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get the service to calculate total amount
    const service = await prisma.service.findUnique({
      where: { id: parseInt(serviceId) },
      include: { provider: true }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        serviceId: parseInt(serviceId),
        customerId: customer.id,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        totalAmount: service.price,
        notes: notes || null,
        status: 'PENDING'
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

    // Create notification for the provider
    try {
      await prisma.notification.create({
        data: {
          providerId: service.providerId,
          title: 'New Booking Request',
          message: `${customerName} has requested ${service.name} for ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
          type: 'BOOKING',
          bookingId: booking.id
        }
      });
      console.log('Notification created successfully for provider:', service.providerId);
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the booking if notification fails
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 