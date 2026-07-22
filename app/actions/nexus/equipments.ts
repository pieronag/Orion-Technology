'use server'

import { getDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { convertTimestamps } from '@/lib/firestore-utils';

export type EquipmentData = {
  id?: string;
  clientId: string;
  type: string;
  brand: string;
  model: string;
  serialNumber?: string;
  accessories: string[];
  condition?: string;
  password?: string;
  photos: string[];
  diagnosisTemplateId?: string;
  diagnosisResults?: Record<string, string>;
  diagnosisNotes?: string;
  notes?: string;
  createdAt?: number;
};

export async function getEquipments(): Promise<{ success: true; equipments: EquipmentData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-equipments').orderBy('createdAt', 'desc').get();
    const equipments = snap.docs.map(d => {
      const data = convertTimestamps({ id: d.id, ...d.data() }) as EquipmentData;
      if (data.photos) data.photos = [];
      return data;
    });
    return { success: true, equipments };
  } catch (e) {
    console.error('Error fetching equipments:', e);
    return { success: false, error: 'Error al cargar equipos' };
  }
}

export async function getEquipment(id: string): Promise<{ success: true; equipment: EquipmentData } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-equipments').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Equipo no encontrado' };
    const equipment = convertTimestamps({ id: doc.id, ...doc.data() }) as EquipmentData;
    return { success: true, equipment };
  } catch (e) {
    return { success: false, error: 'Error al cargar equipo' };
  }
}

export async function getClientEquipments(clientId: string): Promise<{ success: true; equipments: EquipmentData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-equipments')
      .where('clientId', '==', clientId).get();
    const equipments = snap.docs.map(d => {
      const data = convertTimestamps({ id: d.id, ...d.data() }) as EquipmentData;
      if (data.photos) data.photos = [];
      return data;
    });
    equipments.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { success: true, equipments };
  } catch (e) {
    console.error('Error fetching client equipments:', e);
    return { success: false, error: 'Error al cargar equipos del cliente' };
  }
}

export async function createEquipment(data: Omit<EquipmentData, 'id' | 'createdAt'>): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const doc = {
      ...data,
      accessories: data.accessories || [],
      photos: data.photos || [],
      diagnosisResults: data.diagnosisResults || {},
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    };
    const ref = await getDb().collection('nexus-equipments').add(doc);
    return { success: true, id: ref.id };
  } catch (e) {
    console.error('Error creating equipment:', e);
    return { success: false, error: 'Error al crear equipo' };
  }
}

export async function updateEquipment(id: string, data: Partial<EquipmentData>): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-equipments').doc(id).update(data);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al actualizar equipo' };
  }
}

export async function deleteEquipment(id: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-equipments').doc(id).delete();
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al eliminar equipo' };
  }
}

export async function deleteEquipmentPhoto(equipmentId: string, photoIndex: number): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-equipments').doc(equipmentId).get();
    const photos: string[] = doc.data()?.photos || [];
    if (photoIndex < 0 || photoIndex >= photos.length) return { success: false, error: 'Índice inválido' };
    photos.splice(photoIndex, 1);
    await getDb().collection('nexus-equipments').doc(equipmentId).update({ photos });
    return { success: true };
  } catch (e) {
    console.error('Error deleting photo:', e);
    return { success: false, error: 'Error al eliminar foto' };
  }
}

export async function uploadEquipmentPhoto(equipmentId: string, base64: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const doc = await getDb().collection('nexus-equipments').doc(equipmentId).get();
    const existing: string[] = doc.data()?.photos || [];
    existing.push(dataUrl);
    await getDb().collection('nexus-equipments').doc(equipmentId).update({ photos: existing });
    return { success: true };
  } catch (e) {
    console.error('Error uploading photo:', e);
    return { success: false, error: 'Error al subir foto' };
  }
}
