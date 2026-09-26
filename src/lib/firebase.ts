import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
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

  if (rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== '(default)') {
    db = getFirestore(app, rawConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
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
