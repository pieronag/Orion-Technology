import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'secret';
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/nexus')) {
    const token = request.cookies.get('admin_session')?.value;

    if (!token) {
      const redirect = pathname.startsWith('/nexus') ? '/login?to=nexus' : '/login?to=flow';
      return NextResponse.redirect(new URL(redirect, request.url));
    }

    try {
      await jwtVerify(token, key);
      return NextResponse.next();
    } catch {
      const redirect = pathname.startsWith('/nexus') ? '/login?to=nexus' : '/login?to=flow';
      return NextResponse.redirect(new URL(redirect, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/nexus/:path*'],
};
