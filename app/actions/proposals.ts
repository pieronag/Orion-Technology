'use server'

import { getDb, getStorage, getFirebaseAdminApp } from '@/lib/firebase-admin';
import bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { randomUUID } from 'crypto';
import * as admin from 'firebase-admin';

export type ProposalData = {
  id?: string;
  title: string;
  clientName: string;
  content: string;
  passwordHash?: string;
  createdAt?: number;
  expiresAt?: number;
  status?: string;
  vigenciaDias?: number;
};

export async function createProposal(data: ProposalData, plainPassword: string, vigenciaDias: number = 15) {
  try {
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const now = new Date();
    const expiresAt = addDays(now, vigenciaDias);

    let tags: string[] = [];
    try { const c = JSON.parse(data.content); tags = c.tags || []; } catch {}

    const proposalDoc = {
      id,
      title: data.title,
      clientName: data.clientName,
      content: data.content,
      passwordHash,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      status: 'sent',
      vigenciaDias,
      tags,
    };

    await getDb().collection('proposals').doc(id).set(proposalDoc);

    return { success: true, id };
  } catch (error) {
    console.error('Error creating proposal:', error);
    return { success: false, error: 'Error al crear la propuesta' };
  }
}

export async function duplicateProposal(id: string) {
  try {
    const doc = await getDb().collection('proposals').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Propuesta no encontrada' };

    const data = doc.data()!;
    const newId = randomUUID();
    const now = new Date();
    const vigenciaDias = data.vigenciaDias || 15;
    const expiresAt = addDays(now, vigenciaDias);

    await getDb().collection('proposals').doc(newId).set({
      id: newId,
      title: `${data.title} (Copia)`,
      clientName: data.clientName,
      content: data.content,
      passwordHash: data.passwordHash,
      createdAt: admin.firestore.Timestamp.fromDate(now),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      status: 'sent',
      vigenciaDias,
      tags: data.tags || [],
    });

    return { success: true, id: newId };
  } catch (error) {
    console.error('Error duplicating proposal:', error);
    return { success: false, error: 'Error al duplicar la propuesta' };
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
        tags: data.tags || [],
        createdAt: data.createdAt.toMillis(),
        expiresAt: data.expiresAt.toMillis(),
        allowPublicView: data.allowPublicView || false,
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
        status: data.status,
        acceptedAt: data.acceptedAt?.toMillis() || null,
        allowPublicView: data.allowPublicView || false,
      }
    };
  } catch (error) {
    console.error('Error fetching public info:', error);
    return { success: false, error: 'error' };
  }
}

// Obtener contenido de propuesta sin contraseña (solo si allowPublicView)
export async function getProposalPublicContent(id: string) {
  if (!id) return { success: false, error: 'not_found' };
  try {
    const doc = await getDb().collection('proposals').doc(id).get();
    if (!doc.exists) return { success: false, error: 'not_found' };
    const data = doc.data()!;
    if (!data.allowPublicView && data.status !== 'accepted') return { success: false, error: 'acceso_restringido' };
    const now = Date.now();
    if (now > data.expiresAt.toMillis()) return { success: false, error: 'expired' };
    return { success: true, content: data.content, files: data.files || [] };
  } catch (error) {
    console.error('Error fetching public content:', error);
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

    const wasUnlocked = data.status === 'sent';

    if (wasUnlocked) {
      await getDb().collection('proposals').doc(id).update({
        status: 'viewed'
      });

      // Crear notificación
      await getDb().collection('notifications').add({
        proposalId: id,
        clientName: data.clientName || 'Cliente',
        title: data.title || 'Propuesta',
        message: `${data.clientName || 'Un cliente'} ha desbloqueado su propuesta: ${data.title || ''}`,
        read: false,
        createdAt: admin.firestore.Timestamp.fromDate(new Date()),
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

// Obtener detalles completos para el modo de edición (Admin)
export async function getProposalAdminInfo(id: string) {
  if (!id) return { success: false, error: 'not_found' };
  
  try {
    const doc = await getDb().collection('proposals').doc(id).get();
    
    if (!doc.exists) {
      return { success: false, error: 'not_found' };
    }

    const data = doc.data()!;
    return { 
      success: true, 
      proposal: {
        id: data.id,
        title: data.title,
        clientName: data.clientName,
        content: data.content,
        files: data.files || [],
        status: data.status,
        acceptedAt: data.acceptedAt?.toMillis() || null,
        allowPublicView: data.allowPublicView || false,
      }
    };
  } catch (error) {
    console.error('Error fetching admin info:', error);
    return { success: false, error: 'error' };
  }
}

// Guardar una versión de respaldo antes de modificar
async function saveProposalVersionSnapshot(id: string) {
  try {
    const doc = await getDb().collection('proposals').doc(id).get();
    if (!doc.exists) return;
    const data = doc.data()!;
    await getDb().collection('proposals').doc(id).collection('versions').add({
      title: data.title,
      clientName: data.clientName,
      content: data.content,
      status: data.status,
      savedAt: admin.firestore.Timestamp.fromDate(new Date()),
    });
  } catch (e) {
    console.error('Error saving version snapshot:', e);
  }
}

// Actualizar propuesta existente
export async function updateProposal(id: string, data: Partial<ProposalData>, plainPassword?: string) {
  if (!id) return { success: false, error: 'ID no proporcionado' };

  try {
    await saveProposalVersionSnapshot(id);

    let tags: string[] = [];
    try { const c = JSON.parse(data.content || '{}'); tags = c.tags || []; } catch {}

    const updatePayload: any = {
      title: data.title,
      clientName: data.clientName,
      content: data.content,
      tags,
    };

    if (plainPassword) {
      updatePayload.passwordHash = await bcrypt.hash(plainPassword, 10);
    }

    await getDb().collection('proposals').doc(id).update(updatePayload);

    return { success: true };
  } catch (error) {
    console.error('Error updating proposal:', error);
    return { success: false, error: 'Error al actualizar la propuesta' };
  }
}

// Obtener historial de versiones
export async function getProposalVersions(id: string) {
  try {
    const snap = await getDb().collection('proposals').doc(id).collection('versions')
      .orderBy('savedAt', 'desc').limit(20).get();
    const versions = snap.docs.map(d => ({ id: d.id, ...d.data(), savedAt: d.data().savedAt?.toMillis() }));
    return { success: true, versions };
  } catch (error) {
    console.error('Error fetching versions:', error);
    return { success: false, error: 'Error al cargar versiones' };
  }
}

// Restaurar una versión anterior
export async function restoreProposalVersion(id: string, versionId: string) {
  try {
    await saveProposalVersionSnapshot(id);
    const verDoc = await getDb().collection('proposals').doc(id).collection('versions').doc(versionId).get();
    if (!verDoc.exists) return { success: false, error: 'Versión no encontrada' };
    const ver = verDoc.data()!;
    await getDb().collection('proposals').doc(id).update({
      title: ver.title,
      clientName: ver.clientName,
      content: ver.content,
    });
    return { success: true };
  } catch (error) {
    console.error('Error restoring version:', error);
    return { success: false, error: 'Error al restaurar versión' };
  }
}

// Aceptar propuesta (firma digital del cliente)
export async function acceptProposal(id: string) {
  if (!id) return { success: false, error: 'ID no proporcionado' };
  try {
    await getDb().collection('proposals').doc(id).update({
      status: 'accepted',
      acceptedAt: admin.firestore.Timestamp.fromDate(new Date()),
    });
    return { success: true };
  } catch (error) {
    console.error('Error accepting proposal:', error);
    return { success: false, error: 'Error al aceptar la propuesta' };
  }
}

// Obtener notificaciones no leídas
export async function getNotifications() {
  try {
    const snap = await getDb().collection('notifications').orderBy('createdAt', 'desc').limit(20).get();
    const notifications = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toMillis() }));
    return { success: true, notifications };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: 'Error al cargar notificaciones' };
  }
}

// Marcar notificación como leída
export async function markNotificationRead(id: string) {
  try {
    await getDb().collection('notifications').doc(id).update({ read: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking notification:', error);
    return { success: false, error: 'Error' };
  }
}

// Cambiar estado de una propuesta
export async function setProposalStatus(id: string, status: string) {
  if (!id) return { success: false, error: 'ID no proporcionado' };
  try {
    await getDb().collection('proposals').doc(id).update({ status });
    return { success: true };
  } catch (error) {
    console.error('Error updating status:', error);
    return { success: false, error: 'Error al actualizar estado' };
  }
}

// Subir archivo a una propuesta
export async function uploadProposalFile(proposalId: string, fileName: string, fileBase64: string) {
  try {
    const storage = getStorage();
    const bucket = storage.bucket();
    const filePath = `proposals/${proposalId}/${randomUUID()}-${fileName}`;
    const buffer = Buffer.from(fileBase64, 'base64');
    const file = bucket.file(filePath);
    await file.save(buffer, { contentType: 'application/octet-stream' });
    const [url] = await file.getSignedUrl({ action: 'read', expires: '03-01-2030' });

    const doc = await getDb().collection('proposals').doc(proposalId).get();
    const existing: any[] = doc.data()?.files || [];
    existing.push({ name: fileName, url, uploadedAt: Date.now() });
    await getDb().collection('proposals').doc(proposalId).update({ files: existing });

    return { success: true, url, name: fileName };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error: 'Error al subir archivo' };
  }
}

// Obtener archivos de una propuesta
export async function getProposalFiles(proposalId: string) {
  try {
    const doc = await getDb().collection('proposals').doc(proposalId).get();
    return { success: true, files: doc.data()?.files || [] };
  } catch (error) {
    return { success: false, error: 'Error al cargar archivos' };
  }
}

// Guardar nota interna
export async function saveInternalNote(id: string, note: string) {
  try {
    await getDb().collection('proposals').doc(id).update({ internalNote: note });
    return { success: true };
  } catch { return { success: false, error: 'Error' }; }
}

// Guardar avatar del cliente
export async function saveAvatarUrl(id: string, url: string) {
  try {
    await getDb().collection('proposals').doc(id).update({ avatarUrl: url });
    return { success: true };
  } catch { return { success: false, error: 'Error' }; }
}

// Toggle vista pública sin contraseña
export async function setPublicViewAccess(id: string, allow: boolean) {
  try {
    await getDb().collection('proposals').doc(id).update({ allowPublicView: allow });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Error al cambiar acceso' };
  }
}

// Eliminar propuesta permanentemente
export async function deleteProposal(id: string) {
  if (!id) return { success: false, error: 'ID no proporcionado' };

  try {
    await getDb().collection('proposals').doc(id).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting proposal:', error);
    return { success: false, error: 'Error al eliminar la propuesta' };
  }
}
