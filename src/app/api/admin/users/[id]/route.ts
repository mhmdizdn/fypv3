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

    const userId = parseInt(params.id);

    // Delete related records first
    await prisma.review.deleteMany({
      where: { customerId: userId }
    });

    await prisma.booking.deleteMany({
      where: { customerId: userId }
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 