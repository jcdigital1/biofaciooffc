import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import rawConfig from '../../firebase-applet-config.json';

export interface FirebaseConnectionDetails {
  projectId: string;
  authDomain: string;
  storageBucket: string;
  appId: string;
  firestoreDatabaseId: string;
  isConnected: boolean;
  error?: string;
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let isFirebaseConnected = false;
let connectionError: string | null = null;

export const ADMIN_EMAIL = 'jeanncarllostk00@gmail.com';
export const ADMIN_EMAILS = [
  'jeanncarllostk00@gmail.com',
  'jeannleticia00@gmail.com',
];

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((adm) => adm.toLowerCase() === clean);
}

try {
  if (!rawConfig.projectId || !rawConfig.apiKey) {
    throw new Error('Configuração do Firebase incompleta: projectId ou apiKey ausentes no arquivo firebase-applet-config.json');
  }

  const firebaseConfig = {
    apiKey: rawConfig.apiKey,
    authDomain: rawConfig.authDomain,
    projectId: rawConfig.projectId,
    storageBucket: rawConfig.storageBucket,
    messagingSenderId: rawConfig.messagingSenderId,
    appId: rawConfig.appId,
  };

  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);

  const dbId = rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== '(default)'
    ? rawConfig.firestoreDatabaseId
    : undefined;

  try {
    if (dbId) {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      }, dbId);
    } else {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    }
  } catch (fsInitErr) {
    console.warn('[Firebase] initializeFirestore cache fallback:', fsInitErr);
    db = dbId ? getFirestore(app, dbId) : getFirestore(app);
  }

  storage = getStorage(app);
  isFirebaseConnected = true;
} catch (err: any) {
  console.error('Erro ao conectar ao Firebase:', err);
  connectionError = err?.message || 'Falha ao inicializar o Firebase';
  isFirebaseConnected = false;
}

export const firebaseDetails: FirebaseConnectionDetails = {
  projectId: rawConfig.projectId || '',
  authDomain: rawConfig.authDomain || '',
  storageBucket: rawConfig.storageBucket || '',
  appId: rawConfig.appId || '',
  firestoreDatabaseId: rawConfig.firestoreDatabaseId || '(default)',
  isConnected: isFirebaseConnected,
  error: connectionError || undefined,
};

export { app, auth, db, storage, isFirebaseConnected, connectionError };
