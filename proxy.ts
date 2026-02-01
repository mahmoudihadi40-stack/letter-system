import { NextRequest, NextResponse } from 'next/server';

const publicRoutes = ['/login', '/setup', '/api/init'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // بررسی اینکه route public است
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // برای API routes protected
  if (pathname.startsWith('/api')) {
    // session در cookie موجود است یا نه؟
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // برای صفحات dashboard protected
  if (pathname.startsWith('/dashboard') || pathname === '/') {
    const session = request.cookies.get('session');
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
