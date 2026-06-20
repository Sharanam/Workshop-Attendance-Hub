import crypto from 'crypto';
import { cookies } from 'next/headers';

export interface SessionUser {
  email: string;
  name: string;
  picture?: string;
}

const getSessionKey = () => {
  const secret = process.env.SESSION_SECRET || 'default-session-secret-must-be-changed-in-production';
  return crypto.createHash('sha256').update(secret).digest();
};

export function encrypt(data: any): string {
  const text = JSON.stringify(data);
  const iv = crypto.randomBytes(16);
  const key = getSessionKey();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(token: string): any | null {
  try {
    const parts = token.split(':');
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const key = getSessionKey();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) return null;
    return decrypt(sessionToken);
  } catch (e) {
    console.error('Error fetching session user:', e);
    return null;
  }
}
