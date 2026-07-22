'use server'

import { getDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { convertTimestamps } from '@/lib/firestore-utils';

export type InventoryData = {
  id?: string;
  name: string;
  description?: string;
  category?: string;
  supplier?: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  priceHistory?: { price: number; date: number }[];
  createdAt?: number;
};

export type InventoryMovement = {
  id?: string;
  partId: string;
  workOrderId?: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousStock: number;
  newStock: number;
  note?: string;
  createdAt?: number;
};

export async function getInventory(): Promise<{ success: true; items: InventoryData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-inventory').orderBy('name', 'asc').get();
    const items = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as InventoryData[];
    return { success: true, items };
  } catch (e) {
    return { success: false, error: 'Error al cargar inventario' };
  }
}

export async function getInventoryItem(id: string): Promise<{ success: true; item: InventoryData } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-inventory').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Repuesto no encontrado' };
    const item = convertTimestamps({ id: doc.id, ...doc.data() }) as InventoryData;
    return { success: true, item };
  } catch (e) {
    return { success: false, error: 'Error al cargar repuesto' };
  }
}

export async function createInventoryItem(data: Omit<InventoryData, 'id' | 'createdAt' | 'priceHistory'>): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const doc = {
      ...data,
      priceHistory: [{ price: data.costPrice, date: admin.firestore.Timestamp.fromDate(new Date()) }],
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    };
    const ref = await getDb().collection('nexus-inventory').add(doc);
    return { success: true, id: ref.id };
  } catch (e) {
    return { success: false, error: 'Error al crear repuesto' };
  }
}

export async function updateInventoryItem(id: string, data: Partial<InventoryData>): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const updateData: any = { ...data };
    if (data.costPrice !== undefined) {
      const doc = await getDb().collection('nexus-inventory').doc(id).get();
      const current = doc.data()?.priceHistory || [];
      const entry = { price: data.costPrice, date: admin.firestore.Timestamp.fromDate(new Date()) };
      updateData.priceHistory = admin.firestore.FieldValue.arrayUnion(entry);
    }
    await getDb().collection('nexus-inventory').doc(id).update(updateData);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al actualizar repuesto' };
  }
}

export async function adjustStock(id: string, quantity: number, note?: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-inventory').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Repuesto no encontrado' };
    const currentStock = doc.data()?.stock || 0;
    const newStock = currentStock + quantity;
    if (newStock < 0) return { success: false, error: 'Stock insuficiente' };

    await getDb().collection('nexus-inventory').doc(id).update({ stock: newStock });
    await getDb().collection('nexus-inventory-movements').add({
      partId: id,
      type: quantity > 0 ? 'in' : (note === 'ajuste' ? 'adjustment' : 'out'),
      quantity: Math.abs(quantity),
      previousStock: currentStock,
      newStock,
      note: note || '',
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al ajustar stock' };
  }
}

export async function getInventoryMovements(partId: string): Promise<{ success: true; movements: InventoryMovement[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-inventory-movements')
      .where('partId', '==', partId).get();
    const movements = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as InventoryMovement[];
    movements.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { success: true, movements: movements.slice(0, 50) };
  } catch (e) {
    return { success: false, error: 'Error al cargar movimientos' };
  }
}

export async function deleteInventoryItem(id: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-inventory').doc(id).delete();
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al eliminar repuesto' };
  }
}
