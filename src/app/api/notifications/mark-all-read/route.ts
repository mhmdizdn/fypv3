import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// PATCH - Mark all notifications as read for a provider
export async function PATCH(request: NextRequest) {
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

    // Mark all notifications as read
    const updatedNotifications = await prisma.notification.updateMany({
      where: { 
        providerId: provider.id,
        isRead: false
      },
      data: { isRead: true }
    });

    return NextResponse.json({ 
      message: 'All notifications marked as read',
      count: updatedNotifications.count
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 