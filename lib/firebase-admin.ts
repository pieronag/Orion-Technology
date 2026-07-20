import * as admin from 'firebase-admin';

export function getFirebaseAdminApp() {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('⚠️ Variables de entorno de Firebase no encontradas. Saltando inicialización en tiempo de build.');
      return null;
    }
    
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      return null;
    }
  }
  return admin.app();
}

export const getDb = () => {
  getFirebaseAdminApp(); // Asegura inicialización
  return admin.firestore();
};

export const getAuth = () => {
  getFirebaseAdminApp();
  return admin.auth();
};

export const getStorage = () => {
  getFirebaseAdminApp();
  return admin.storage();
};
