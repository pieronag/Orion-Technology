'use server'

import { getDb } from '@/lib/firebase-admin';
import * as admin from 'firebase-admin';
import { convertTimestamps } from '@/lib/firestore-utils';

export type PaymentData = {
  id?: string;
  workOrderId: string;
  clientId: string;
  amount: number;
  method: 'cash' | 'transfer' | 'card' | 'other';
  date: number;
  notes?: string;
  registeredBy?: string;
  createdAt?: number;
};

export async function getPayments(): Promise<{ success: true; payments: PaymentData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-payments').orderBy('date', 'desc').get();
    const payments = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as PaymentData[];
    return { success: true, payments };
  } catch (e) {
    return { success: false, error: 'Error al cargar pagos' };
  }
}

export async function getWorkOrderPayments(workOrderId: string): Promise<{ success: true; payments: PaymentData[] } | { success: false; error: string }> {
  try {
    const snap = await getDb().collection('nexus-payments')
      .where('workOrderId', '==', workOrderId).get();
    const payments = snap.docs.map(d => convertTimestamps({ id: d.id, ...d.data() })) as PaymentData[];
    payments.sort((a, b) => (a.date || 0) - (b.date || 0));
    return { success: true, payments };
  } catch (e) {
    return { success: false, error: 'Error al cargar pagos' };
  }
}

export async function createPayment(data: Omit<PaymentData, 'id' | 'createdAt'>): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    const doc = {
      ...data,
      date: admin.firestore.Timestamp.fromMillis(data.date),
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    };
    const ref = await getDb().collection('nexus-payments').add(doc);

    const paymentsResult = await getWorkOrderPayments(data.workOrderId);
    if (paymentsResult.success && paymentsResult.payments) {
      const totalPaid = paymentsResult.payments.reduce((s, p) => s + p.amount, 0) + data.amount;
      const orderDoc = await getDb().collection('nexus-work-orders').doc(data.workOrderId).get();
      const orderTotal = orderDoc.data()?.totalAmount || 0;
      let paymentStatus = 'pending';
      if (totalPaid >= orderTotal) paymentStatus = 'paid';
      else if (totalPaid > 0) paymentStatus = 'partial';
      await getDb().collection('nexus-work-orders').doc(data.workOrderId).update({ paymentStatus });
    }

    return { success: true, id: ref.id };
  } catch (e) {
    console.error('Error creating payment:', e);
    return { success: false, error: 'Error al registrar pago' };
  }
}

export async function deletePayment(id: string, workOrderId: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await getDb().collection('nexus-payments').doc(id).delete();
    const paymentsResult = await getWorkOrderPayments(workOrderId);
    if (paymentsResult.success && paymentsResult.payments) {
      const totalPaid = paymentsResult.payments.reduce((s, p) => s + p.amount, 0);
      const orderDoc = await getDb().collection('nexus-work-orders').doc(workOrderId).get();
      const orderTotal = orderDoc.data()?.totalAmount || 0;
      let paymentStatus = 'pending';
      if (totalPaid >= orderTotal) paymentStatus = 'paid';
      else if (totalPaid > 0) paymentStatus = 'partial';
      await getDb().collection('nexus-work-orders').doc(workOrderId).update({ paymentStatus });
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: 'Error al eliminar pago' };
  }
}
