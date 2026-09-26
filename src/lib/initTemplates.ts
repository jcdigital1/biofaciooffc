import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { INITIAL_TEMPLATES } from '../constants/initialTemplates';

let initialized = false;

/**
 * Non-destructive initial seed:
 * Verifies if the template ID already exists. If it does, does NOT overwrite.
 * If not found, persists it. Never resets or wipes the collection.
 */
export async function ensureDefaultTemplates(): Promise<void> {
  if (initialized || !db) return;
  initialized = true;

  try {
    for (const tpl of INITIAL_TEMPLATES) {
      const ref = doc(db, 'templates', tpl.templateId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, tpl);
        console.log(`[Bio Fácil] Modelo padrão salvo no Firestore: ${tpl.name}`);
      }
    }
  } catch (err) {
    console.warn('[Bio Fácil] Seed idempotente de modelos:', err);
  }
}
