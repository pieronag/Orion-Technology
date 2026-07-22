'use server'

import { getDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { convertTimestamps } from '@/lib/firestore-utils';

export type QuoteItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  type: 'labor' | 'part';
  partId?: string;
};

export type QuoteData = {
  id?: string;
  quoteNumber: number;
  equipmentId: string;
  clientId: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  isTemplate?: boolean;
  templateName?: string;
  items: QuoteItem[];
  subtotal: number;
  total: number;
  billingType: 'sin_boleta' | 'con_boleta';
  iva?: number;
  grandTotal: number;
  validUntil?: number;
  notes?: string;
  internalNotes?: string;
  pdfUrl?: string;
  createdAt?: number;
  sentAt?: number;
  approvedAt?: number;
};

async function getNextQuoteNumber() {
  const counterRef = getDb().collection('nexus-counter').doc('quoteCounter');
  await counterRef.set({ value: admin.firestore.FieldValue.increment(1) }, { merge: true });
  const doc = await counterRef.get();
  return doc.data()?.value || 1;
}

export async function getQuotes(): Promise<{ success: true; quotes: QuoteData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-quotes').orderBy('createdAt', 'desc').get();
    const quotes = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as QuoteData[];
    return { success: true, quotes };
  } catch (e) {
    return { success: false, error: 'Error al cargar cotizaciones' };
  }
}

export async function getQuote(id: string): Promise<{ success: true; quote: QuoteData } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-quotes').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Cotización no encontrada' };
    const quote = convertTimestamps({ id: doc.id, ...doc.data() }) as QuoteData;
    return { success: true, quote };
  } catch (e) {
    return { success: false, error: 'Error al cargar cotización' };
  }
}

export async function createQuote(data: Omit<QuoteData, 'id' | 'createdAt' | 'quoteNumber'>): Promise<{ success: true; id: string; quoteNumber: number } | { success: false; error: string }> {
  try {
    const quoteNumber = await getNextQuoteNumber();
    const doc = {
      ...data,
      quoteNumber,
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
      validUntil: data.validUntil ? admin.firestore.Timestamp.fromMillis(data.validUntil) : admin.firestore.Timestamp.fromDate(new Date(Date.now() + 15 * 86400000)),
    };
    const ref = await getDb().collection('nexus-quotes').add(doc);
    return { success: true, id: ref.id, quoteNumber };
  } catch (e) {
    console.error('Error creating quote:', e);
    return { success: false, error: 'Error al crear cotización' };
  }
}

export async function updateQuote(id: string, data: Partial<QuoteData>): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const updateData: any = { ...data };
    if (data.validUntil) updateData.validUntil = admin.firestore.Timestamp.fromMillis(data.validUntil);
    await getDb().collection('nexus-quotes').doc(id).update(updateData);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al actualizar cotización' };
  }
}

export async function setQuoteStatus(id: string, status: QuoteData['status']): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const update: any = { status };
    if (status === 'sent') update.sentAt = admin.firestore.Timestamp.fromDate(new Date());
    if (status === 'approved') update.approvedAt = admin.firestore.Timestamp.fromDate(new Date());
    await getDb().collection('nexus-quotes').doc(id).update(update);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al actualizar estado' };
  }
}

export async function deleteQuote(id: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-quotes').doc(id).delete();
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al eliminar cotización' };
  }
}

export async function getQuoteTemplates(): Promise<{ success: true; templates: QuoteData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-quotes').where('isTemplate', '==', true).get();
    const templates = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as QuoteData[];
    return { success: true, templates };
  } catch (e) {
    return { success: false, error: 'Error al cargar plantillas' };
  }
}

export async function getQuoteLinkedWorkOrder(quoteId: string): Promise<{ success: true; workOrderId: string | null } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-work-orders')
      .where('quoteId', '==', quoteId).limit(1).get();
    if (snap.empty) return { success: true, workOrderId: null };
    return { success: true, workOrderId: snap.docs[0].id };
  } catch (e) {
    return { success: false, error: 'Error al buscar orden vinculada' };
  }
}

export async function getEquipmentQuotes(equipmentId: string): Promise<{ success: true; quotes: QuoteData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-quotes')
      .where('equipmentId', '==', equipmentId).get();
    const quotes = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as QuoteData[];
    quotes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { success: true, quotes };
  } catch (e) {
    return { success: false, error: 'Error al cargar cotizaciones del equipo' };
  }
}

export async function saveQuoteAsTemplate(id: string, templateName: string): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-quotes').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Cotización no encontrada' };
    const data = doc.data()!;
    const { status, ...rest } = data;
    const templateDoc = {
      ...rest,
      isTemplate: true,
      templateName,
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    };
    const ref = await getDb().collection('nexus-quotes').add(templateDoc);
    return { success: true, id: ref.id };
  } catch (e) {
    return { success: false, error: 'Error al guardar plantilla' };
  }
}
