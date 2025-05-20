import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { saveFile } from "@/lib/upload";

// PUT /api/provider/services/:id - Update a service
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    // Find the service first to verify ownership
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: { provider: true }
    });

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    // Verify that the service belongs to the logged-in provider
    if (existingService.provider.email !== session.user.email) {
      return NextResponse.json(
        { message: "You are not authorized to update this service" },
        { status: 403 }
      );
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

    // Handle image upload if present
    let imageUrl = existingService.imageUrl;
    if (image && image.size > 0) {
      imageUrl = await saveFile(image);
    }

    // Update the service
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl
      }
    });

    return NextResponse.json({
      service: updatedService,
      message: "Service updated successfully"
    });
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}

// DELETE /api/provider/services/:id - Delete a service
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    // Find the service first to verify ownership
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: { provider: true }
    });

    if (!existingService) {
      return NextResponse.json(
        { message: "Service not found" },
        { status: 404 }
      );
    }

    // Verify that the service belongs to the logged-in provider
    if (existingService.provider.email !== session.user.email) {
      return NextResponse.json(
        { message: "You are not authorized to delete this service" },
        { status: 403 }
      );
    }

    // Delete the service
    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Service deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
} 