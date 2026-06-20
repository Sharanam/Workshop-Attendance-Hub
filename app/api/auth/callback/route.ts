import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const defaultRedirectUri = `${protocol}://${host}/api/auth/callback`;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri;

  try {
    // Exchange auth code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenData);
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const { access_token } = tokenData;

    // Fetch user profile info using the access token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info fetch error:', userData);
      return NextResponse.redirect(new URL('/?error=user_info_failed', request.url));
    }

    // Set cookie
    const sessionUser = {
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    };

    const encryptedSession = encrypt(sessionUser);

    const cookieStore = await cookies();
    cookieStore.set('session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url));
  }
}
