import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

// Ensure the uploads directory exists
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function saveFile(file: File): Promise<string> {
  try {
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Ensure uploads directory exists
    try {
      await mkdir(UPLOADS_DIR, { recursive: true });
    } catch (e) {
      // Directory might already exist, ignore error
    }

    // Generate a unique filename to avoid collisions
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Get file extension from MIME type for security
    const ext = getExtensionFromMimeType(file.type);
    
    // Create a unique filename using crypto
    const filename = `${randomBytes(16).toString('hex')}${ext}`;
    const filepath = join(UPLOADS_DIR, filename);
    
    // Save the file
    await writeFile(filepath, buffer);
    
    // Return the relative URL to the file
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error; // Re-throw to let the API handle it
  }
}

function getExtensionFromMimeType(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
    case 'image/jpg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    default:
      return '.jpg'; // Default fallback
  }
} 