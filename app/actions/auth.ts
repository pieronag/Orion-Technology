'use server'

import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'secret';
const key = new TextEncoder().encode(secretKey);

export async function loginAdmin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(key);

    (await cookies()).set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return { success: true };
  }

  return { success: false, error: 'Contraseña incorrecta' };
}

export async function logoutAdmin() {
  (await cookies()).delete('admin_session');
}
