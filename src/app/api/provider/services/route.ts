import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/provider/services - Get all services for the logged-in provider
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const provider = await prisma.serviceProvider.findUnique({
            where: { email: session.user.email! },
            include: { services: true }
        });

        if (!provider) {
            return NextResponse.json(
                { message: "Provider not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ services: provider.services || [] });
    } catch (error) {
        console.error("Error fetching services:", error);
        return NextResponse.json(
            { message: "Something went wrong!" },
            { status: 500 }
        );
    }
}

// POST /api/provider/services - Create a new service
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session || !session.user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { name, description, price, category } = body;

        // Validate required fields
        if (!name || !description || !price || !category) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const provider = await prisma.serviceProvider.findUnique({
            where: { email: session.user.email! }
        });

        if (!provider) {
            return NextResponse.json(
                { message: "Provider not found" },
                { status: 404 }
            );
        }

        // Create new service
        const service = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category,
                providerId: provider.id
            }
        });

        return NextResponse.json(
            { service, message: "Service created successfully" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating service:", error);
        return NextResponse.json(
            { message: "Something went wrong!" },
            { status: 500 }
        );
    }
} 