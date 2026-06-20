import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const defaultRedirectUri = `${protocol}://${host}/api/auth/callback`;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || defaultRedirectUri;

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.GOOGLE_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=openid%20email%20profile&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
