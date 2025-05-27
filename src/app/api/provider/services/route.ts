import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveFile } from "@/lib/upload";
import { mkdir, stat } from 'fs/promises';
import { join } from 'path';

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

        // Ensure uploads directory exists
        const uploadsDir = join(process.cwd(), 'public', 'uploads');
        try {
            await stat(uploadsDir);
        } catch (e) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Parse the multipart form data
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const price = formData.get('price') as string;
        const category = formData.get('category') as string;
        const image = formData.get('image') as File | null;

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

        // Check if provider has filled in required profile information
        if (!provider.phone || !provider.latitude || !provider.longitude) {
            return NextResponse.json(
                { 
                    message: "Please complete your profile first. You need to add your phone number and shop location before adding services.",
                    missingFields: {
                        phone: !provider.phone,
                        location: !provider.latitude || !provider.longitude
                    }
                },
                { status: 400 }
            );
        }

        // Handle image upload if present
        let imageUrl = null;
        if (image && image.size > 0) {
            imageUrl = await saveFile(image);
        }

        // Create new service
        const service = await prisma.service.create({
            data: {
                name,
                description,
                price: parseFloat(price),
                category,
                imageUrl,
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