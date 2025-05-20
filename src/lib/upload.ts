import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Ensure the uploads directory exists
const UPLOADS_DIR = join(process.cwd(), 'public', 'uploads');

export async function saveFile(file: File): Promise<string> {
  try {
    // Generate a unique filename to avoid collisions
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Get file extension
    const originalName = file.name;
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    
    // Create a unique filename
    const filename = `${uuidv4()}${ext}`;
    const filepath = join(UPLOADS_DIR, filename);
    
    // Save the file
    await writeFile(filepath, buffer);
    
    // Return the relative URL to the file
    return `/uploads/${filename}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save the file');
  }
} 