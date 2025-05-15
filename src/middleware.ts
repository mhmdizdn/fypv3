import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/register');

  if (isAuthPage) {
    if (token) {
      // If user is already logged in, redirect based on user type
      const userType = (token as any).userType;
      if (userType === 'serviceProvider') {
        return NextResponse.redirect(new URL('/dashboard/provider', request.url));
      } else {
        return NextResponse.redirect(new URL('/index', request.url));
      }
    }
    return NextResponse.next();
  }

  // Protect provider dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard/provider')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if ((token as any).userType !== 'serviceProvider') {
      return NextResponse.redirect(new URL('/index', request.url));
    }
  }

  // Protect user routes
  if (request.nextUrl.pathname.startsWith('/index')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/index/:path*', '/login', '/register']
}; 