import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookingId = parseInt(params.id);

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