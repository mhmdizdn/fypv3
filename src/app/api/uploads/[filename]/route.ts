import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  console.log('=== IMAGE API REQUEST ===');
  console.log('Requested filename:', params.filename);
  console.log('Request URL:', request.url);
  console.log('Current working directory:', process.cwd());
  
  try {
    const filename = params.filename;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      console.error('Invalid filename detected:', filename);
      return new NextResponse('Invalid filename', { status: 400 });
    }
    
    const imagePath = join(process.cwd(), 'public', 'uploads', filename);
    console.log('Looking for image at:', imagePath);
    
    // Check if file exists
    let stats;
    try {
      stats = await stat(imagePath);
      console.log('File found, size:', stats.size, 'bytes');
      
      if (!stats.isFile()) {
        console.error('Path exists but is not a file:', imagePath);
        return new NextResponse('Not a file', { status: 404 });
      }
    } catch (error) {
      console.error('File not found:', imagePath);
      console.error('Stat error:', error);
      return new NextResponse('Image not found', { status: 404 });
    }
    
    // Read and serve the file
    console.log('Reading file...');
    const imageBuffer = await readFile(imagePath);
    console.log('File read successfully, buffer size:', imageBuffer.length);
    
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
    
    console.log('Serving image with content type:', contentType);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Last-Modified': stats.mtime.toUTCString(),
        'Content-Length': imageBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('=== ERROR SERVING IMAGE ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Full error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 