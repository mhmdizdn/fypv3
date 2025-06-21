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

    const serviceId = parseInt(params.id);
    const body = await request.json();
    const { name, description, price, category } = body;

    const updatedService = await prisma.service.update({
      where: { id: serviceId },
      data: {
        name: name || undefined,
        description: description || undefined,
        price: price ? parseFloat(price) : undefined,
        category: category || undefined,
      },
      include: {
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
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
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

    const serviceId = parseInt(params.id);

    // Delete related records first
    await prisma.review.deleteMany({
      where: { serviceId: serviceId }
    });

    await prisma.booking.deleteMany({
      where: { serviceId: serviceId }
    });

    // Delete the service
    await prisma.service.delete({
      where: { id: serviceId }
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 