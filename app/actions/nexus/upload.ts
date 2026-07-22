'use server'

import { getStorage } from '@/lib/firebase-admin';
import { randomUUID } from 'crypto';

export async function uploadBase64File(folder: string, base64: string, fileName?: string) {
  try {
    const storage = getStorage();
    const bucket = storage.bucket();
    const uuid = randomUUID();
    const ext = fileName?.split('.').pop() || 'jpg';
    const filePath = `nexus/${folder}/${uuid}.${ext}`;
    const buffer = Buffer.from(base64, 'base64');
    const file = bucket.file(filePath);

    let contentType = 'application/octet-stream';
    if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    else if (ext === 'webp') contentType = 'image/webp';

    await file.save(buffer, { contentType });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2030' });

    return { success: true, url, path: filePath };
  } catch (e) {
    console.error('Error uploading file:', e);
    return { success: false, error: 'Error al subir archivo' };
  }
}
