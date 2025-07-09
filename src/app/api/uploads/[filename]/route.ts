import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return new NextResponse('Invalid filename', { status: 400 });
    }
    
    const imagePath = join(process.cwd(), 'public', 'uploads', filename);
    
    // Check if file exists
    try {
      const stats = await stat(imagePath);
      if (!stats.isFile()) {
        return new NextResponse('Not a file', { status: 404 });
      }
    } catch (error) {
      console.error('Image not found:', imagePath);
      return new NextResponse('Image not found', { status: 404 });
    }
    
    // Read and serve the file
    const imageBuffer = await readFile(imagePath);
    
    // Determine content type based on file extension
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (ext) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      default:
        contentType = 'application/octet-stream';
    }
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour instead of forever
        'Last-Modified': new Date().toUTCString(),
      },
    });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 