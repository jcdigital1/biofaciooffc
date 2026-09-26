import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, ADMIN_EMAIL, isFirebaseConnected, isUserAdmin } from '../lib/firebase';
import { UserProfile } from '../types';
import { loadStoredUserProfile, saveStoredUserProfile } from '../lib/storage';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isApproved: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConnected || !auth) {
      setLoading(false);
      return;
    }

    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      const isMasterAdmin = isUserAdmin(user.email);

      // Fast-load from local cache to avoid screen flicker or delay
      const cached = loadStoredUserProfile(user.uid);
      if (cached) {
        setUserProfile({
          ...cached,
          role: isMasterAdmin ? 'admin' : cached.role || 'user',
          status: isMasterAdmin ? 'approved' : cached.status || 'approved',
        });
      }

      try {
        if (!db) {
          // If firestore instance is not ready, set profile from cached/master admin
          if (isMasterAdmin && !cached) {
            const adm: UserProfile = {
              uid: user.uid,
              name: user.displayName || 'Administrador Bio Fácil',
              email: user.email || ADMIN_EMAIL,
              role: 'admin',
              status: 'approved',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setUserProfile(adm);
            saveStoredUserProfile(adm);
          }
          setLoading(false);
          return;
        }

        const userRef = doc(db, 'users', user.uid);

        // Real-time snapshot listener on the user's profile document
        unsubscribeSnapshot = onSnapshot(
          userRef,
          async (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data() as UserProfile;
              // If it's the master admin, ensure role is admin and status approved
              if (isMasterAdmin && (data.role !== 'admin' || data.status !== 'approved')) {
                try {
                  await setDoc(
                    userRef,
                    {
                      role: 'admin',
                      status: 'approved',
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  );
                } catch {
                  // Silently ignore write errors if quota is hit
                }
              }
              const finalProfile: UserProfile = {
                ...data,
                uid: user.uid,
                role: isMasterAdmin ? 'admin' : data.role || 'user',
                status: isMasterAdmin ? 'approved' : data.status || 'approved',
              };
              setUserProfile(finalProfile);
              saveStoredUserProfile(finalProfile);
            } else {
              // Document does not exist yet
              if (isMasterAdmin) {
                // Instantly bootstrap Admin profile
                const adminDocData: UserProfile = {
                  uid: user.uid,
                  name: user.displayName || 'Administrador Bio Fácil',
                  email: user.email || ADMIN_EMAIL,
                  role: 'admin',
                  status: 'approved',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                };
                try {
                  await setDoc(userRef, adminDocData);
                } catch {
                  // Ignore if quota exceeded
                }
                setUserProfile(adminDocData);
                saveStoredUserProfile(adminDocData);
              } else {
                // Common user doc missing (safety fallback)
                const newDocData: UserProfile = {
                  uid: user.uid,
                  name: user.displayName || 'Usuário',
                  email: user.email || '',
                  role: 'user',
                  status: 'approved',
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                };
                try {
                  await setDoc(userRef, newDocData);
                } catch {
                  // Ignore if quota exceeded
                }
                setUserProfile(newDocData);
                saveStoredUserProfile(newDocData);
              }
            }
            setLoading(false);
          },
          (err) => {
            console.warn('[Bio Fácil Auth] Listener de perfil Firestore (usando fallback offline):', err);
            if (isMasterAdmin) {
              const adm: UserProfile = {
                uid: user.uid,
                name: user.displayName || 'Administrador Bio Fácil',
                email: user.email || ADMIN_EMAIL,
                role: 'admin',
                status: 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setUserProfile(adm);
              saveStoredUserProfile(adm);
            } else {
              const existingCached = loadStoredUserProfile(user.uid);
              if (existingCached) {
                setUserProfile(existingCached);
              } else {
                const userFallback: UserProfile = {
                  uid: user.uid,
                  name: user.displayName || user.email?.split('@')[0] || 'Usuário',
                  email: user.email || '',
                  role: 'user',
                  status: 'approved',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                setUserProfile(userFallback);
                saveStoredUserProfile(userFallback);
              }
            }
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.warn('[Bio Fácil Auth] Erro ao verificar usuário:', err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass);
    } catch (err: any) {
      console.error('Erro de login:', err);
      let message = 'Falha ao autenticar no Firebase.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Formato de e-mail inválido.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas sem sucesso. Tente novamente mais tarde.';
      } else {
        message = err.message || message;
      }
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, pass: string) => {
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail === ADMIN_EMAIL.toLowerCase().trim()) {
      const msg = 'Esta conta possui acesso administrativo. Utilize Fazer Login.';
      setError(msg);
      throw new Error(msg);
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      const user = userCredential.user;

      const newProfile: UserProfile = {
        uid: user.uid,
        name: name.trim() || 'Usuário',
        email: cleanEmail,
        role: 'user',
        status: 'approved',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveStoredUserProfile(newProfile);
      setUserProfile(newProfile);

      // Attempt sync to Firestore without blocking the user if quota is reached
      if (db) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            uid: user.uid,
            name: name.trim() || 'Usuário',
            email: cleanEmail,
            role: 'user',
            status: 'approved',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (dbErr) {
          console.warn('[Bio Fácil Auth] Erro ao persistir usuário no Firestore (armazenado localmente):', dbErr);
        }
      }
    } catch (err: any) {
      console.error('Erro ao cadastrar usuário:', err);
      let message = 'Falha ao criar conta no Firebase.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está cadastrado. Faça login.';
      } else if (err.code === 'auth/weak-password') {
        message = 'A senha deve conter no mínimo 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'E-mail inválido.';
      } else {
        message = err.message || message;
      }
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Erro ao sair:', err);
    }
  };

  const refreshProfile = async () => {
    if (!currentUser) return;
    try {
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    } catch (err) {
      console.error('Erro ao recarregar perfil:', err);
    }
  };

  const clearError = () => setError(null);

  const isMasterAdmin = currentUser?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
  const isAdmin = isMasterAdmin || (userProfile?.role === 'admin' && userProfile?.status === 'approved');
  const isApproved = isMasterAdmin || userProfile?.status === 'approved';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isApproved,
        loading,
        error,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
