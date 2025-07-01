// API Helper functions to assist with route validation
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to check admin authentication
export async function checkAdminAuth() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).userType !== 'admin') {
      return { authenticated: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { authenticated: true, session };
  } catch (error) {
    console.error('Auth error:', error);
    return { authenticated: false, response: NextResponse.json({ error: 'Authentication error' }, { status: 500 }) };
  }
}

// Helper function to validate IDs from URL params
export function validateId(params: { id?: string }) {
  if (!params || !params.id) {
    return { valid: false, response: NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 }) };
  }
  
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return { valid: false, response: NextResponse.json({ error: 'Invalid ID format' }, { status: 400 }) };
  }
  
  return { valid: true, id };
}

// Create a default handler for route methods (useful during build)
export function createDefaultHandler() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
} 