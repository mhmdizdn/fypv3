import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { compare } from 'bcrypt';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, userType } = body;

        if (!userType || !["user", "serviceProvider"].includes(userType)) {
            return NextResponse.json(
                { message: "Invalid user type" },
                { status: 400 }
            );
        }

        let account;
        if (userType === "user") {
            account = await prisma.user.findUnique({
                where: { email: email }
            });
        } else {
            account = await prisma.serviceProvider.findUnique({
                where: { email: email }
            });
        }

        if (!account) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Compare passwords
        const isPasswordValid = await compare(password, account.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Remove password from response
        const { password: _, ...accountWithoutPassword } = account;

        return NextResponse.json(
            { 
                account: accountWithoutPassword, 
                userType,
                message: "Login successful" 
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "Something went wrong!" },
            { status: 500 }
        );
    }
} 