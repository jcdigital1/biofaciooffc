import { BioTemplate, BioProject, UserProfile } from '../types';
import { INITIAL_TEMPLATES } from '../constants/initialTemplates';

const STORAGE_KEYS = {
  TEMPLATES: 'bio_facil_templates_v2',
  PROJECTS: 'bio_facil_projects_v2',
  USERS: 'bio_facil_users_v2',
  USER_PREFIX: 'bio_facil_user_profile_',
};

function getLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    // Storage access blocked or unavailable
  }
  return null;
}

/**
 * Loads templates from localStorage and merges seamlessly with INITIAL_TEMPLATES.
 * Preserves all imported, edited, or pre-existing templates without data loss.
 */
export function loadStoredTemplates(): BioTemplate[] {
  try {
    const storage = getLocalStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.TEMPLATES) : null;
    const stored: BioTemplate[] = raw ? JSON.parse(raw) : [];

    const map = new Map<string, BioTemplate>();

    // 1. Seed base catalog
    for (const tpl of INITIAL_TEMPLATES) {
      if (tpl && tpl.templateId) {
        map.set(tpl.templateId, tpl);
      }
    }

    // 2. Overlay any saved/imported templates (preserves user customizations & imported models)
    if (Array.isArray(stored)) {
      for (const tpl of stored) {
        if (tpl && tpl.templateId) {
          map.set(tpl.templateId, {
            ...(map.get(tpl.templateId) || {}),
            ...tpl,
          });
        }
      }
    }

    const merged = Array.from(map.values());
    return merged;
  } catch (err) {
    console.warn('[Bio Fácil Storage] Erro ao carregar modelos locais:', err);
    return [...INITIAL_TEMPLATES];
  }
}

/**
 * Persists the complete template catalog locally.
 */
export function saveStoredTemplates(templates: BioTemplate[]): void {
  try {
    if (!Array.isArray(templates) || templates.length === 0) return;
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    }
  } catch (err) {
    console.warn('[Bio Fácil Storage] Erro ao salvar modelos locais:', err);
  }
}

/**
 * Adds or updates a single template in local persistence.
 */
export function upsertStoredTemplate(template: BioTemplate): BioTemplate[] {
  const current = loadStoredTemplates();
  const idx = current.findIndex((t) => t.templateId === template.templateId);
  let updated: BioTemplate[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...current[idx], ...template };
  } else {
    updated = [template, ...current];
  }
  saveStoredTemplates(updated);
  return updated;
}

/**
 * Removes a template from local persistence.
 */
export function removeStoredTemplate(templateId: string): BioTemplate[] {
  const current = loadStoredTemplates();
  const updated = current.filter((t) => t.templateId !== templateId);
  saveStoredTemplates(updated);
  return updated;
}

/**
 * Loads projects from localStorage.
 */
export function loadStoredProjects(userId?: string): BioProject[] {
  try {
    const storage = getLocalStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.PROJECTS) : null;
    const stored: BioProject[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(stored)) return [];
    if (userId) {
      return stored.filter((p) => p.ownerUid === userId);
    }
    return stored;
  } catch (err) {
    console.warn('[Bio Fácil Storage] Erro ao carregar projetos locais:', err);
    return [];
  }
}

/**
 * Saves or updates a project locally.
 */
export function saveStoredProject(project: BioProject): BioProject[] {
  try {
    const storage = getLocalStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.PROJECTS) : null;
    const stored: BioProject[] = raw ? JSON.parse(raw) : [];
    const valid = Array.isArray(stored) ? stored : [];
    const idx = valid.findIndex((p) => (p.id || p.projectId) === (project.id || project.projectId));

    let updated: BioProject[];
    if (idx >= 0) {
      updated = [...valid];
      updated[idx] = { ...valid[idx], ...project };
    } else {
      updated = [project, ...valid];
    }
    if (storage) {
      storage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    }
    return updated;
  } catch (err) {
    console.warn('[Bio Fácil Storage] Erro ao salvar projeto local:', err);
    return [];
  }
}

/**
 * Removes a project locally.
 */
export function removeStoredProject(projectId: string): BioProject[] {
  try {
    const storage = getLocalStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.PROJECTS) : null;
    const stored: BioProject[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(stored)) return [];
    const updated = stored.filter((p) => (p.id || p.projectId) !== projectId);
    if (storage) {
      storage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
    }
    return updated;
  } catch (err) {
    console.warn('[Bio Fácil Storage] Erro ao remover projeto local:', err);
    return [];
  }
}

/**
 * Loads a user's cached profile.
 */
export function loadStoredUserProfile(uid: string): UserProfile | null {
  try {
    const storage = getLocalStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.USER_PREFIX + uid) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persists a user's profile locally and updates admin user cache.
 */
export function saveStoredUserProfile(profile: UserProfile): void {
  try {
    if (!profile || !profile.uid) return;
    const storage = getLocalStorage();
    if (!storage) return;

    storage.setItem(STORAGE_KEYS.USER_PREFIX + profile.uid, JSON.stringify(profile));

    // Also update users list for admin overview
    const rawUsers = storage.getItem(STORAGE_KEYS.USERS);
    const users: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
    const list = Array.isArray(users) ? users : [];
    const idx = list.findIndex((u) => u.uid === profile.uid);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...profile };
    } else {
      list.push(profile);
    }
    storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
  } catch (err) {
    console.warn('[Bio Fácil Storage] Erro ao salvar perfil local:', err);
  }
}

/**
 * Loads all cached users for Admin panel.
 */
export function loadStoredUsers(): UserProfile[] {
  try {
    const storage = getLocalStorage();
    const raw = storage ? storage.getItem(STORAGE_KEYS.USERS) : null;
    const stored = raw ? JSON.parse(raw) : [];
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

/**
 * Saves all users for Admin panel.
 */
export function saveStoredUsers(users: UserProfile[]): void {
  try {
    if (!Array.isArray(users)) return;
    const storage = getLocalStorage();
    if (storage) {
      storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  } catch (err) {
    console.warn('[Bio Fácil Storage] Erro ao salvar usuários locais:', err);
  }
}
