import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).userType !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const services = await prisma.service.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 