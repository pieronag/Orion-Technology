'use server'

import { getDb } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { randomUUID } from 'crypto';
import * as admin from 'firebase-admin';

export type ProposalData = {
  id?: string;
  title: string;
  clientName: string;
  content: string; // JSON string or HTML
  passwordHash?: string;
  createdAt?: number;
  expiresAt?: number;
  status?: string;
};

// Crear una nueva propuesta
export async function createProposal(data: ProposalData, plainPassword: string) {
  try {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    
    const now = new Date();
    const expiresAt = addDays(now, 15); // 15 días de vigencia

    const proposalDoc = {
      id,
      title: data.title,
      clientName: data.clientName,
      content: data.content,
      passwordHash,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      status: 'sent',
    };

    await getDb().collection('proposals').doc(id).set(proposalDoc);

    return { success: true, id };
  } catch (error) {
    console.error('Error creating proposal:', error);
    return { success: false, error: 'Error al crear la propuesta' };
  }
}

// Obtener todas las propuestas para el dashboard admin
export async function getProposals() {
  try {
    const snapshot = await getDb().collection('proposals').orderBy('createdAt', 'desc').get();
    const proposals = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        title: data.title,
        clientName: data.clientName,
        status: data.status,
        createdAt: data.createdAt.toMillis(),
        expiresAt: data.expiresAt.toMillis(),
      };
    });
    return { success: true, proposals };
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return { success: false, error: 'Error al cargar las propuestas' };
  }
}

// Obtener detalles básicos de una propuesta para la vista pública (sin contenido)
export async function getProposalPublicInfo(id: string) {
  if (!id) return { success: false, error: 'not_found' };
  
  try {
    const doc = await getDb().collection('proposals').doc(id).get();
    
    if (!doc.exists) {
      return { success: false, error: 'not_found' };
    }

    const data = doc.data()!;
    const now = Date.now();
    const expiresAt = data.expiresAt.toMillis();

    if (now > expiresAt) {
      return { success: false, error: 'expired' };
    }

    return { 
      success: true, 
      proposal: {
        id: data.id,
        title: data.title,
        clientName: data.clientName,
        expiresAt,
      }
    };
  } catch (error) {
    console.error('Error fetching public info:', error);
    return { success: false, error: 'error' };
  }
}

// Validar contraseña y devolver contenido
export async function unlockProposal(id: string, plainPassword: string) {
  if (!id) return { success: false, error: 'Propuesta no encontrada' };

  try {
    const doc = await getDb().collection('proposals').doc(id).get();
    
    if (!doc.exists) {
      return { success: false, error: 'Propuesta no encontrada' };
    }

    const data = doc.data()!;
    const now = Date.now();
    
    if (now > data.expiresAt.toMillis()) {
      return { success: false, error: 'La propuesta ha expirado' };
    }

    const isMatch = await bcrypt.compare(plainPassword, data.passwordHash);

    if (!isMatch) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    // Actualizar estado a visto si estaba en sent
    if (data.status === 'sent') {
      await getDb().collection('proposals').doc(id).update({
        status: 'viewed'
      });
    }

    return { 
      success: true, 
      content: data.content 
    };
  } catch (error) {
    console.error('Error unlocking proposal:', error);
    return { success: false, error: 'Error interno' };
  }
}
