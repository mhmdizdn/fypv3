import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: "admin@gmail.com" }
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 400 });
    }

    // Create admin user
    const hashedPassword = await hash("admin123", 12);
    
    const admin = await prisma.admin.create({
      data: {
        email: "admin@gmail.com",
        username: "admin",
        name: "System Administrator",
        password: hashedPassword,
      }
    });

    return NextResponse.json({ 
      message: "Admin user created successfully",
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        name: admin.name
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 