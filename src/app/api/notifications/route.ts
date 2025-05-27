import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET - Fetch notifications for a provider
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session in notifications API:', session);
    if (!session?.user?.email) {
      console.log('No session or email found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { email: session.user.email }
    });

    console.log('Provider found:', provider);
    if (!provider) {
      console.log('Provider not found for email:', session.user.email);
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Get notifications for this provider
    const notifications = await prisma.notification.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to latest 20 notifications
    });

    console.log('Found notifications:', notifications.length, notifications);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new notification (internal use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerId, title, message, type, bookingId } = body;

    // Validate required fields
    if (!providerId || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        providerId,
        title,
        message,
        type: type || 'BOOKING',
        bookingId: bookingId || null
      }
    });

    return NextResponse.json({ notification }, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 