import * as admin from 'firebase-admin';
import bcrypt from 'bcrypt';
import { addDays } from 'date-fns';
import { randomUUID } from 'crypto';
import { defaultProposalTemplate } from '../lib/proposal-template';
import { ProposalContent } from '../lib/proposal-helpers';

// Cargar variables de entorno desde .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

const PASSWORD = 'maskota2026';

async function seed() {
  // Inicializar Firebase Admin
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.error('❌ Variables de entorno de Firebase no encontradas. Asegúrate de tener .env.local configurado.');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  }

  const db = admin.firestore();
  const id = randomUUID();
  const now = new Date();
  const vigenciaDias = 15;
  const expiresAt = addDays(now, vigenciaDias);
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // El contenido es exactamente el template por defecto
  const content: ProposalContent = { ...defaultProposalTemplate };

  const proposalDoc = {
    id,
    title: content.title,
    clientName: content.clientName,
    content: JSON.stringify(content),
    passwordHash,
    createdAt: admin.firestore.Timestamp.fromDate(now),
    expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
    status: 'sent',
    vigenciaDias,
    tags: content.tags,
    files: [],
  };

  await db.collection('proposals').doc(id).set(proposalDoc);

  console.log('\n✅ Propuesta insertada exitosamente en Firestore');
  console.log(`   ID:      ${id}`);
  console.log(`   Cliente: ${content.clientName}`);
  console.log(`   Título:  ${content.title}`);
  console.log(`   Total:   ${content.commercial.total}`);
  console.log(`   Plazo:   ${content.commercial.timeline}`);
  console.log(`   Tags:    ${content.tags.join(', ')}`);
  console.log(`   Link:    https://www.oriontechnology.cl/p/${id}`);
  console.log(`   Contraseña: ${PASSWORD}`);
  console.log(`   Vigencia: ${vigenciaDias} días\n`);

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Error al ejecutar seed:', err);
  process.exit(1);
});
