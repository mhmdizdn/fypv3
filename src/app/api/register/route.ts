import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password, userType, username, serviceType } = await request.json();

    // Validate input
    if (!name || !email || !password || !userType || !username || (userType === "serviceProvider" && !serviceType)) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists in either table
    let existingUser = null;
    let existingProvider = null;
    try {
      existingUser = await prisma.user.findFirst({ 
        where: { 
          OR: [
            { email },
            { username }
          ]
        } 
      });
    } catch (e) { /* ignore if table doesn't exist */ }
    try {
      existingProvider = await prisma.serviceProvider.findFirst({ 
        where: { 
          OR: [
            { email },
            { username }
          ]
        } 
      });
    } catch (e) { /* ignore if table doesn't exist */ }

    if (existingUser || existingProvider) {
      return NextResponse.json(
        { message: "Email or username already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const userData = {
      name,
      email,
      username,
      password: hashedPassword,
    };

    // Save to appropriate collection based on user type
    if (userType === "user") {
      await prisma.user.create({
        data: userData
      });
    } else if (userType === "serviceProvider") {
      await prisma.serviceProvider.create({
        data: {
          ...userData,
          serviceType
        }
      });
    } else {
      return NextResponse.json(
        { message: "Invalid user type" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
} 