'use server'

import { getDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { convertTimestamps } from '@/lib/firestore-utils';

export async function getPublicEquipmentInfo(id: string): Promise<{
  success: true; equipment: {
    id: string; type: string; brand: string; model: string;
    serialNumber?: string; clientName: string; photos: string[];
  };
  currentOrder: {
    id: string; status: string; timeline: { status: string; date: number; note: string }[];
    paymentStatus: string; totalAmount: number;
    warranty: { days: number; expiresAt: number | null } | null;
  } | null;
} | { success: false; error: string }> {
  if (!id) return { success: false, error: 'not_found' };
  try {
    const doc = await getDb().collection('nexus-equipments').doc(id).get();
    if (!doc.exists) return { success: false, error: 'not_found' };
    const data = convertTimestamps(doc.data())!;

    const clientDoc = await getDb().collection('nexus-clients').doc(data.clientId).get();
    const clientName = clientDoc.data()?.name || 'Cliente';

    const ordersSnap = await getDb().collection('nexus-work-orders')
      .where('equipmentId', '==', id).get();
    let currentOrder = null;
    if (!ordersSnap.empty) {
      const docs = ordersSnap.docs.map(d => convertTimestamps(d.data()));
      docs.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));
      const orderData = docs[0];
      currentOrder = {
        id: ordersSnap.docs[0].id,
        status: orderData.status,
        timeline: (orderData.timeline || []).map((t: any) => ({
          status: t.status, date: t.date, note: t.note || '',
        })),
        paymentStatus: orderData.paymentStatus,
        totalAmount: orderData.totalAmount,
        warranty: orderData.warranty ? {
          days: orderData.warranty.days,
          expiresAt: orderData.warranty.expiresAt || null,
        } : null,
      };
    }

    return {
      success: true,
      equipment: {
        id: data.id || id,
        type: data.type,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        clientName,
        photos: data.photos || [],
      },
      currentOrder,
    };
  } catch (e) {
    console.error('Error fetching public info:', e);
    return { success: false, error: 'error' };
  }
}

export async function approveQuotePublic(quoteId: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-quotes').doc(quoteId).get();
    if (!doc.exists) return { success: false, error: 'not_found' };
    const data = convertTimestamps(doc.data())!;
    const equipmentId = data.equipmentId;

    const ordersSnap = await getDb().collection('nexus-work-orders')
      .where('equipmentId', '==', equipmentId).where('status', '==', 'quoted').limit(1).get();

    if (!ordersSnap.empty) {
      const orderId = ordersSnap.docs[0].id;
      await getDb().collection('nexus-work-orders').doc(orderId).update({
        status: 'approved',
        approvedAt: admin.firestore.Timestamp.fromDate(new Date()),
        timeline: admin.firestore.FieldValue.arrayUnion({
          status: 'approved',
          date: new Date(),
          note: 'Aprobada por el cliente vía portal público',
          by: 'Cliente',
        }),
      });
    }

    await getDb().collection('nexus-quotes').doc(quoteId).update({
      status: 'approved',
      approvedAt: admin.firestore.Timestamp.fromDate(new Date()),
    });

    return { success: true };
  } catch (e) {
    console.error('Error approving quote:', e);
    return { success: false, error: 'Error' };
  }
}

export async function getPublicWorkOrderInfo(id: string): Promise<{
  success: true;
  order: {
    id: string; status: string; timeline: { status: string; date: number; note: string }[];
    warranty: { days: number; expiresAt: number | null } | null;
    diagnosis?: string; repairNotes?: string; afterPhotos?: string[];
  };
  equipment: { type: string; brand: string; model: string; serialNumber?: string; photos: string[] };
  clientName: string;
} | { success: false; error: string }> {
  if (!id) return { success: false, error: 'not_found' };
  try {
    const doc = await getDb().collection('nexus-work-orders').doc(id).get();
    if (!doc.exists) return { success: false, error: 'not_found' };
    const data = convertTimestamps(doc.data())!;

    const eqDoc = await getDb().collection('nexus-equipments').doc(data.equipmentId).get();
    const eqData = convertTimestamps(eqDoc.data()) || {};

    const clientDoc = await getDb().collection('nexus-clients').doc(data.clientId).get();
    const clientName = clientDoc.data()?.name || 'Cliente';

    return {
      success: true,
      order: {
        id: doc.id,
        status: data.status,
        timeline: (data.timeline || []).map((t: any) => ({
          status: t.status, date: t.date, note: t.note || '',
        })),
        warranty: data.warranty ? {
          days: data.warranty.days,
          expiresAt: data.warranty.expiresAt || null,
        } : null,
        diagnosis: data.diagnosis,
        repairNotes: data.repairNotes,
        afterPhotos: data.afterPhotos || [],
      },
      equipment: {
        type: eqData.type || '',
        brand: eqData.brand || '',
        model: eqData.model || '',
        serialNumber: eqData.serialNumber,
        photos: eqData.photos || [],
      },
      clientName,
    };
  } catch (e) {
    console.error('Error fetching public work order:', e);
    return { success: false, error: 'error' };
  }
}

export async function getPublicQuoteInfo(id: string): Promise<{
  success: true;
  quote: {
    id: string; quoteNumber: number; status: string;
    items: { description: string; quantity: number; unitPrice: number; type: string }[];
    subtotal: number; total: number; grandTotal: number;
    billingType: string; iva?: number;
    notes?: string; validUntil?: number;
    createdAt?: number;
  };
  equipment: { type: string; brand: string; model: string; serialNumber?: string };
  clientName: string;
} | { success: false; error: string }> {
  if (!id) return { success: false, error: 'not_found' };
  try {
    const doc = await getDb().collection('nexus-quotes').doc(id).get();
    if (!doc.exists) return { success: false, error: 'not_found' };
    const data = convertTimestamps(doc.data())!;

    const eqDoc = await getDb().collection('nexus-equipments').doc(data.equipmentId).get();
    const eqData = convertTimestamps(eqDoc.data()) || {};

    const clientDoc = await getDb().collection('nexus-clients').doc(data.clientId).get();
    const clientName = clientDoc.data()?.name || 'Cliente';

    return {
      success: true,
      quote: {
        id: doc.id,
        quoteNumber: data.quoteNumber,
        status: data.status,
        items: (data.items || []).map((i: any) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          type: i.type,
        })),
        subtotal: data.subtotal || 0,
        total: data.total || 0,
        grandTotal: data.grandTotal || 0,
        billingType: data.billingType || 'sin_boleta',
        iva: data.iva,
        notes: data.notes,
        validUntil: data.validUntil,
        createdAt: data.createdAt,
      },
      equipment: {
        type: eqData.type || '',
        brand: eqData.brand || '',
        model: eqData.model || '',
        serialNumber: eqData.serialNumber,
      },
      clientName,
    };
  } catch (e) {
    console.error('Error fetching public quote:', e);
    return { success: false, error: 'error' };
  }
}
