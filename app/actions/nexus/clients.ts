'use server'

import { getDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { convertTimestamps } from '@/lib/firestore-utils';

export type ClientData = {
  id?: string;
  name: string;
  rut?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  billingType: 'sin_boleta' | 'con_boleta';
  createdAt?: number;
};

export async function getClients(): Promise<{ success: true; clients: ClientData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-clients').orderBy('name', 'asc').get();
    const clients = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as ClientData[];
    return { success: true, clients };
  } catch (e) {
    console.error('Error fetching clients:', e);
    return { success: false, error: 'Error al cargar clientes' };
  }
}

export async function getClient(id: string): Promise<{ success: true; client: ClientData } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-clients').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Cliente no encontrado' };
    const client = convertTimestamps({ id: doc.id, ...doc.data() }) as ClientData;
    return { success: true, client };
  } catch (e) {
    return { success: false, error: 'Error al cargar cliente' };
  }
}

export async function createClient(data: Omit<ClientData, 'id' | 'createdAt'>): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const doc = { ...data, createdAt: admin.firestore.Timestamp.fromDate(new Date()) };
    const ref = await getDb().collection('nexus-clients').add(doc);
    return { success: true, id: ref.id };
  } catch (e) {
    console.error('Error creating client:', e);
    return { success: false, error: 'Error al crear cliente' };
  }
}

export async function updateClient(id: string, data: Partial<ClientData>): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-clients').doc(id).update(data);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al actualizar cliente' };
  }
}

export async function deleteClient(id: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-clients').doc(id).delete();
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al eliminar cliente' };
  }
}

export async function searchClients(query: string): Promise<{ success: true; clients: ClientData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-clients')
      .orderBy('name').startAt(query).endAt(query + '\uf8ff').limit(20).get();
    const clients = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as ClientData[];
    return { success: true, clients };
  } catch (e) {
    return { success: false, error: 'Error en búsqueda' };
  }
}
