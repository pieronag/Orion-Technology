'use server'

import { getDb } from '@/lib/firebase-admin';

export type NexusSettings = {
  technicians: string[];
  branches: string[];
  defaultWarranty: number;
};

export async function getSettings(): Promise<{ success: true; settings: NexusSettings } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-settings').doc('default').get();
    if (!doc.exists) {
      return { success: true, settings: { technicians: [], branches: [], defaultWarranty: 30 } };
    }
    const data = doc.data()!;
    return {
      success: true,
      settings: {
        technicians: data.technicians || [],
        branches: data.branches || [],
        defaultWarranty: data.defaultWarranty || 30,
      },
    };
  } catch (e) {
    console.error('Error fetching settings:', e);
    return { success: false, error: 'Error al cargar configuración' };
  }
}

export async function saveSettings(settings: NexusSettings): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-settings').doc('default').set(settings);
    return { success: true };
  } catch (e) {
    console.error('Error saving settings:', e);
    return { success: false, error: 'Error al guardar configuración' };
  }
}
