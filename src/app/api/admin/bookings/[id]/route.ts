import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAdminAuth, validateId, createDefaultHandler } from "@/lib/api-helpers";

// Add empty GET handler to help with route collection during build
export async function GET() {
  return createDefaultHandler();
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) {
      return authResult.response;
    }
    
    // Validate ID
    const idResult = validateId(params);
    if (!idResult.valid) {
      return idResult.response;
    }
    
    const bookingId = idResult.id;
    const body = await request.json();
    const { customerName, customerEmail, customerPhone, status, totalAmount } = body;

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        customerPhone: customerPhone || undefined,
        status: status || undefined,
        totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
      },
      include: {
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
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authentication
    const authResult = await checkAdminAuth();
    if (!authResult.authenticated) {
      return authResult.response;
    }
    
    // Validate ID
    const idResult = validateId(params);
    if (!idResult.valid) {
      return idResult.response;
    }
    
    const bookingId = idResult.id;

    // Delete related records first
    await prisma.review.deleteMany({
      where: { bookingId: bookingId }
    });

    // Delete the booking
    await prisma.booking.delete({
      where: { id: bookingId }
    });

    return NextResponse.json({ message: "Booking deleted successfully" });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 