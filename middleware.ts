import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');

  const validUser = process.env.BASIC_AUTH_USER;
  const validPass = process.env.BASIC_AUTH_PASSWORD;

  // If Basic Auth is not configured in env, bypass the check
  if (!validUser || !validPass) {
    return NextResponse.next();
  }

  if (basicAuth) {
    try {
      const authValue = basicAuth.split(' ')[1];
      const decoded = atob(authValue);
      const [user, pwd] = decoded.split(':');

      if (user === validUser && pwd === validPass) {
        return NextResponse.next();
      }
    } catch (e) {
      // Ignore decoding errors and prompt for auth again
    }
  }

  return new NextResponse('Authentication Required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Attendance Portal"',
    },
  });
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
