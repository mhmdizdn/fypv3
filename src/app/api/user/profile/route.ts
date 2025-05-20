import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { hash, compare } from "bcryptjs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      username: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Prepare update data
  const updateData: any = {
    name: data.name,
    username: data.username,
  };

  // Handle email update
  if (data.email && data.email !== session.user.email) {
    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    updateData.email = data.email;
  }

  // Handle password update
  if (data.currentPassword && data.newPassword) {
    // Verify current password
    const isPasswordValid = await compare(data.currentPassword, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password
    updateData.password = await hash(data.newPassword, 10);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { email: session.user.email },
    data: updateData,
    select: {
      name: true,
      email: true,
      username: true,
    },
  });

  return NextResponse.json(updatedUser);
}