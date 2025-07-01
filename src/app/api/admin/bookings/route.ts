import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // During build time, just return empty data to allow build to complete
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json([]);
    }
    
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookings = await prisma.booking.findMany({
      include: {
        service: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                serviceType: true,
              }
            }
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 