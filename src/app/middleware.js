//middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const userToken = request.cookies.get('userToken'); 


  if (pathname.startsWith('/admin') || pathname.startsWith('/booking') || pathname.startsWith('/profile')) {
    if (!userToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/booking/:path*', '/profile/:path*', '/sereach/:path*'],
};
