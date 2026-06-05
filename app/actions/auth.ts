'use server'

import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'secret';
const key = new TextEncoder().encode(secretKey);

export async function loginAdmin(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    // Generate JWT
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // Session valid for 24 hours
      .sign(key);

    // Set Cookie
    (await cookies()).set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true };
  } else {
    return { success: false, error: 'Contraseña incorrecta' };
  }
}

export async function logoutAdmin() {
  (await cookies()).delete('admin_session');
}
