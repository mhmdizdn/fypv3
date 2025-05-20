import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || (session.user as any).userType !== 'serviceProvider') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const provider = await prisma.serviceProvider.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      username: true,
      serviceType: true,
    },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  return NextResponse.json(provider);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email || (session.user as any).userType !== 'serviceProvider') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const provider = await prisma.serviceProvider.findUnique({
    where: { email: session.user.email },
  });

  if (!provider) {
    return NextResponse.json({ error: "Provider not found" }, { status: 404 });
  }

  // Prepare update data
  const updateData: any = {
    name: data.name,
    username: data.username,
    serviceType: data.serviceType,
  };

  // Handle email update
  if (data.email && data.email !== session.user.email) {
    // Check if email is already taken
    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { email: data.email },
    });

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingProvider || existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    updateData.email = data.email;
  }

  // Handle password update
  if (data.currentPassword && data.newPassword) {
    // Verify current password
    const { compare, hash } = await import('bcryptjs');
    const isPasswordValid = await compare(data.currentPassword, provider.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password
    updateData.password = await hash(data.newPassword, 10);
  }

  // Update provider
  const updatedProvider = await prisma.serviceProvider.update({
    where: { email: session.user.email },
    data: updateData,
    select: {
      name: true,
      email: true,
      username: true,
      serviceType: true,
    },
  });

  return NextResponse.json(updatedProvider);
} 