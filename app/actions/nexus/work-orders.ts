'use server'

import { getDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';

export type TimelineEntry = {
  status: string;
  date: number;
  note?: string;
  by?: string;
};

export type WorkOrderData = {
  id?: string;
  quoteId?: string;
  equipmentId: string;
  clientId: string;
  status: string;
  assignedTo?: string;
  branch?: string;
  diagnosis?: string;
  repairNotes?: string;
  timeline: TimelineEntry[];
  warranty: { days: number; expiresAt?: number } | null;
  warrantyClaim: boolean;
  billingType: 'sin_boleta' | 'con_boleta';
  totalAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid';
  receivedAt?: number;
  diagnosedAt?: number;
  quotedAt?: number;
  approvedAt?: number;
  repairingAt?: number;
  testingAt?: number;
  readyAt?: number;
  deliveredAt?: number;
  cancelledAt?: number;
  signatureUrl?: string;
  deliveryNoteUrl?: string;
  afterPhotos?: string[];
  createdAt?: number;
};

function convertOrder(data: FirebaseFirestore.DocumentData): WorkOrderData {
  return {
    id: data.id,
    quoteId: data.quoteId,
    equipmentId: data.equipmentId,
    clientId: data.clientId,
    status: data.status,
    assignedTo: data.assignedTo,
    branch: data.branch,
    diagnosis: data.diagnosis,
    repairNotes: data.repairNotes,
    billingType: data.billingType || 'sin_boleta',
    totalAmount: data.totalAmount || 0,
    paymentStatus: data.paymentStatus || 'pending',
    warrantyClaim: data.warrantyClaim || false,
    warranty: data.warranty ? { days: data.warranty.days, expiresAt: data.warranty.expiresAt?.toMillis?.() } : null,
    timeline: (data.timeline || []).map((t: any) => ({ status: t.status, date: t.date?.toMillis?.() || t.date, note: t.note, by: t.by })),
    createdAt: data.createdAt?.toMillis?.() || 0,
    receivedAt: data.receivedAt?.toMillis?.(),
    diagnosedAt: data.diagnosedAt?.toMillis?.(),
    quotedAt: data.quotedAt?.toMillis?.(),
    approvedAt: data.approvedAt?.toMillis?.(),
    repairingAt: data.repairingAt?.toMillis?.(),
    testingAt: data.testingAt?.toMillis?.(),
    readyAt: data.readyAt?.toMillis?.(),
    deliveredAt: data.deliveredAt?.toMillis?.(),
    cancelledAt: data.cancelledAt?.toMillis?.(),
    signatureUrl: data.signatureUrl,
    deliveryNoteUrl: data.deliveryNoteUrl,
    afterPhotos: data.afterPhotos || [],
  };
}

export async function getWorkOrders(): Promise<{ success: true; orders: WorkOrderData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-work-orders').orderBy('createdAt', 'desc').get();
    const orders = snap.docs.map(d => convertOrder({ id: d.id, ...d.data() }));
    return { success: true, orders };
  } catch (e) {
    console.error('Error fetching work orders:', e);
    return { success: false, error: 'Error al cargar órdenes' };
  }
}

export async function getWorkOrder(id: string): Promise<{ success: true; order: WorkOrderData } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-work-orders').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Orden no encontrada' };
    const data = doc.data()!;
    return { success: true, order: convertOrder({ id: doc.id, ...data }) };
  } catch (e) {
    return { success: false, error: 'Error al cargar orden' };
  }
}

export async function getEquipmentWorkOrders(equipmentId: string): Promise<{ success: true; orders: WorkOrderData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-work-orders')
      .where('equipmentId', '==', equipmentId).get();
    const orders = snap.docs.map(d => convertOrder({ id: d.id, ...d.data() }));
    orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return { success: true, orders };
  } catch (e) {
    console.error('Error fetching equipment work orders:', e);
    return { success: false, error: 'Error al cargar órdenes del equipo' };
  }
}

export async function createWorkOrder(data: Omit<WorkOrderData, 'id' | 'createdAt'>): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const now = new Date();
    const timelineEntry: TimelineEntry = { status: data.status, date: now.getTime(), note: 'Orden creada', by: 'Admin' };
    const doc: any = {
      equipmentId: data.equipmentId,
      clientId: data.clientId,
      status: data.status,
      quoteId: data.quoteId,
      assignedTo: data.assignedTo,
      branch: data.branch,
      diagnosis: data.diagnosis,
      repairNotes: data.repairNotes,
      billingType: data.billingType,
      totalAmount: data.totalAmount,
      paymentStatus: data.paymentStatus || 'pending',
      warrantyClaim: data.warrantyClaim || false,
      warranty: data.warranty ? { days: data.warranty.days, expiresAt: data.warranty.expiresAt ? admin.firestore.Timestamp.fromMillis(data.warranty.expiresAt) : null } : null,
      timeline: [timelineEntry, ...(data.timeline || [])],
      [data.status + 'At']: admin.firestore.Timestamp.fromDate(now),
      createdAt: admin.firestore.Timestamp.fromDate(now),
    };
    const ref = await getDb().collection('nexus-work-orders').add(doc);
    return { success: true, id: ref.id };
  } catch (e) {
    console.error('Error creating work order:', e);
    return { success: false, error: 'Error al crear orden' };
  }
}

export async function updateWorkOrderStatus(id: string, status: string, note?: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const now = new Date();
    const timelineEntry: TimelineEntry = { status, date: now.getTime(), note: note || '', by: 'Admin' };
    const update: any = {
      status,
      timeline: admin.firestore.FieldValue.arrayUnion(timelineEntry),
      [status + 'At']: admin.firestore.Timestamp.fromDate(now),
    };
    await getDb().collection('nexus-work-orders').doc(id).update(update);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al actualizar estado' };
  }
}

export async function updateWorkOrder(id: string, data: Partial<WorkOrderData>): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const updateData: any = { ...data };
    if (data.warranty) {
      updateData.warranty = { days: data.warranty.days, expiresAt: data.warranty.expiresAt ? admin.firestore.Timestamp.fromMillis(data.warranty.expiresAt) : null };
    }
    await getDb().collection('nexus-work-orders').doc(id).update(updateData);
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al actualizar orden' };
  }
}

export async function saveSignature(id: string, signatureUrl: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-work-orders').doc(id).update({ signatureUrl });
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al guardar firma' };
  }
}

export async function uploadAfterPhoto(workOrderId: string, base64: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const doc = await getDb().collection('nexus-work-orders').doc(workOrderId).get();
    const existing: string[] = doc.data()?.afterPhotos || [];
    existing.push(dataUrl);
    await getDb().collection('nexus-work-orders').doc(workOrderId).update({ afterPhotos: existing });
    return { success: true };
  } catch (e) {
    console.error('Error uploading after photo:', e);
    return { success: false, error: 'Error al subir foto' };
  }
}

export async function deleteAfterPhoto(workOrderId: string, photoIndex: number): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const doc = await getDb().collection('nexus-work-orders').doc(workOrderId).get();
    const photos: string[] = doc.data()?.afterPhotos || [];
    if (photoIndex < 0 || photoIndex >= photos.length) return { success: false, error: 'Índice inválido' };
    photos.splice(photoIndex, 1);
    await getDb().collection('nexus-work-orders').doc(workOrderId).update({ afterPhotos: photos });
    return { success: true };
  } catch (e) {
    console.error('Error deleting after photo:', e);
    return { success: false, error: 'Error al eliminar foto' };
  }
}

export async function deleteWorkOrder(id: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-work-orders').doc(id).delete();
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al eliminar orden' };
  }
}
