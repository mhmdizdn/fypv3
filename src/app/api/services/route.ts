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
                        username: true,
                        email: true,
                        serviceType: true,
                        phone: true,
                        latitude: true,
                        longitude: true,
                        address: true
                    }
                },
                reviews: {
                    include: {
                        customer: {
                            select: {
                                name: true,
                                username: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
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