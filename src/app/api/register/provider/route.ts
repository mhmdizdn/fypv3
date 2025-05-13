import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash } from 'bcrypt';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { username, email, password, serviceType } = body;

        // Check if email already exists
        const existingProvider = await prisma.serviceProvider.findUnique({
            where: { email }
        });

        if (existingProvider) {
            return NextResponse.json(
                { message: "Email already registered" },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUsername = await prisma.serviceProvider.findUnique({
            where: { username }
        });

        if (existingUsername) {
            return NextResponse.json(
                { message: "Username already taken" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hash(password, 10);

        // Create service provider
        const provider = await prisma.serviceProvider.create({
            data: {
                username,
                email,
                password: hashedPassword,
                serviceType
            }
        });

        // Remove password from response
        const { password: _, ...providerWithoutPassword } = provider;

        return NextResponse.json(
            { provider: providerWithoutPassword, message: "Registration successful" },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Something went wrong!" },
            { status: 500 }
        );
    }
} 