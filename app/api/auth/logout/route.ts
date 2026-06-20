import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  cookieStore.set('session', '', {
    path: '/',
    maxAge: 0,
  });
  return NextResponse.redirect(new URL('/', request.url));
}
