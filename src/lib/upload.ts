import { writeFile, mkdir, chmod } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';

// Ensure the uploads directory exists
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

// Allowed file types
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function saveFile(file: File): Promise<string> {
  try {
    console.log('=== FILE UPLOAD START ===');
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Ensure uploads directory exists with proper permissions
    try {
      await mkdir(UPLOADS_DIR, { recursive: true });
      await chmod(UPLOADS_DIR, 0o755);
      console.log('Upload directory ensured:', UPLOADS_DIR);
    } catch (e) {
      console.log('Directory setup error (might be normal):', e);
    }

    // Generate a unique filename to avoid collisions
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Get file extension from MIME type for security
    const ext = getExtensionFromMimeType(file.type);
    
    // Create a unique filename using crypto
    const filename = `${randomBytes(16).toString('hex')}${ext}`;
    const filepath = join(UPLOADS_DIR, filename);
    
    console.log('Saving file to:', filepath);
    
    // Save the file
    await writeFile(filepath, buffer);
    
    // Set file permissions to ensure it's readable
    try {
      await chmod(filepath, 0o644);
    } catch (permError) {
      console.warn('Could not set file permissions:', permError);
    }
    
    console.log('File saved successfully');
    
    // Return the API route URL instead of direct file path
    const apiUrl = `/api/uploads/${filename}`;
    console.log('Returning API URL:', apiUrl);
    
    return apiUrl;
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
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