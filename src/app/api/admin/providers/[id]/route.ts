import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providerId = parseInt(params.id);
    const body = await request.json();
    const { username, email, name, serviceType, phone } = body;

    const updatedProvider = await prisma.serviceProvider.update({
      where: { id: providerId },
      data: {
        username: username || undefined,
        email: email || undefined,
        name: name || undefined,
        serviceType: serviceType || undefined,
        phone: phone || undefined,
      },
    });

    return NextResponse.json(updatedProvider);
  } catch (error) {
    console.error('Error updating service provider:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const providerId = parseInt(params.id);

    // Delete related records first
    await prisma.notification.deleteMany({
      where: { providerId: providerId }
    });

    await prisma.review.deleteMany({
      where: { 
        service: {
          providerId: providerId
        }
      }
    });

    await prisma.booking.deleteMany({
      where: { 
        service: {
          providerId: providerId
        }
      }
    });

    await prisma.service.deleteMany({
      where: { providerId: providerId }
    });

    // Delete the service provider
    await prisma.serviceProvider.delete({
      where: { id: providerId }
    });

    return NextResponse.json({ message: "Service provider deleted successfully" });
  } catch (error) {
    console.error('Error deleting service provider:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 