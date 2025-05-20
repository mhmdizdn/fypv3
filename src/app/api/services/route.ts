import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/services - Get all available services from all providers
export async function GET() {
    try {
        const services = await prisma.service.findMany({
            include: {
                provider: {
                    select: {
                        id: true,
                        name: true,
                        serviceType: true,
                        latitude: true,
                        longitude: true,
                        address: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({ services });
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json(
            { message: "Something went wrong!" },
            { status: 500 }
        );
    }
} 