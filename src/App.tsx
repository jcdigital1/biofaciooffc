/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { isFirebaseConnected, db, ADMIN_EMAIL } from './lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { UserProfile, BioTemplate, BioProject, NicheInfo } from './types';
import {
  loadStoredTemplates,
  saveStoredTemplates,
  upsertStoredTemplate,
  removeStoredTemplate,
  loadStoredProjects,
  saveStoredProject,
  removeStoredProject,
  loadStoredUsers,
  saveStoredUsers,
} from './lib/storage';
import { FirebaseStatusBanner } from './components/FirebaseStatusBanner';
import { AuthScreen } from './components/AuthScreen';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { AdminHeader, AdminTab } from './components/AdminPanel/AdminHeader';
import { AdminOverview } from './components/AdminPanel/AdminOverview';
import { AdminUsers } from './components/AdminPanel/AdminUsers';
import { AdminTemplates } from './components/AdminPanel/AdminTemplates';
import { AdminImportBioSite } from './components/AdminPanel/AdminImportBioSite';
import { AdminNiches } from './components/AdminPanel/AdminNiches';
import { AdminProjects } from './components/AdminPanel/AdminProjects';
import { AdminSettings } from './components/AdminPanel/AdminSettings';
import { ClientHeader } from './components/ClientHome/ClientHeader';
import { NicheSelector } from './components/ClientHome/NicheSelector';
import { NicheModelsList } from './components/ClientHome/NicheModelsList';
import { TemplatePreviewModal } from './components/ClientHome/TemplatePreviewModal';
import { MyProjectsModal } from './components/ClientHome/MyProjectsModal';
import { BioEditor } from './components/Editor/BioEditor';
import { AlertCircle, RefreshCw } from 'lucide-react';

function cleanForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data, (_, value) => (value === undefined ? null : value)));
}

function MainApp() {
  const { currentUser, userProfile, isAdmin, isApproved, loading } = useAuth();

  // Firestore real-time & persistent collections state
  const [users, setUsers] = useState<UserProfile[]>(() => loadStoredUsers());
  const [templates, setTemplates] = useState<BioTemplate[]>(() => loadStoredTemplates());
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const [projects, setProjects] = useState<BioProject[]>(() => loadStoredProjects(currentUser?.uid));

  // Navigation states
  const [viewMode, setViewMode] = useState<'admin' | 'client'>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Client view states
  const [selectedNiche, setSelectedNiche] = useState<NicheInfo | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<BioTemplate | null>(null);
  const [activeEditingTemplate, setActiveEditingTemplate] = useState<BioTemplate | null>(null);
  const [activeEditingProject, setActiveEditingProject] = useState<BioProject | null>(null);
  const [isMyProjectsOpen, setIsMyProjectsOpen] = useState(false);

  // Sync projects from local cache when user changes
  useEffect(() => {
    if (currentUser) {
      const cached = loadStoredProjects(isAdmin ? undefined : currentUser.uid);
      if (cached && cached.length > 0) {
        setProjects(cached);
      }
    }
  }, [currentUser, isAdmin]);

  // Sync users real-time when admin is logged in
  useEffect(() => {
    if (!currentUser || !isAdmin || !db) return;

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list: UserProfile[] = [];
        snapshot.forEach((d) => {
          list.push({ ...d.data(), uid: d.id } as UserProfile);
        });
        setUsers(list);
        saveStoredUsers(list);
      },
      (err) => {
        console.warn('[Bio Fácil] Escutando coleção users (usando cache local):', err);
        const cached = loadStoredUsers();
        if (cached.length > 0) setUsers(cached);
      }
    );

    return () => unsubUsers();
  }, [currentUser, isAdmin]);

  // Sync global templates real-time from Firestore with seamless local fallback
  useEffect(() => {
    if (!currentUser || !db) return;

    const unsubTemplates = onSnapshot(
      collection(db, 'templates'),
      (snapshot) => {
        const firestoreList: BioTemplate[] = [];
        snapshot.forEach((d) => {
          firestoreList.push(d.data() as BioTemplate);
        });

        // Merge Firestore templates with local templates to preserve all saved models
        const map = new Map<string, BioTemplate>();
        const localList = loadStoredTemplates();
        for (const t of localList) {
          if (t && t.templateId) map.set(t.templateId, t);
        }
        for (const t of firestoreList) {
          if (t && t.templateId) {
            map.set(t.templateId, {
              ...(map.get(t.templateId) || {}),
              ...t,
            });
          }
        }
        const merged = Array.from(map.values());
        setTemplates(merged);
        saveStoredTemplates(merged);
        setTemplatesLoading(false);
        setTemplatesError(null);
      },
      (err) => {
        console.warn('[Bio Fácil] Sincronização Firestore indisponível (usando catálogo persistente local):', err);
        const localList = loadStoredTemplates();
        setTemplates(localList);
        setTemplatesLoading(false);
      }
    );

    return () => unsubTemplates();
  }, [currentUser]);

  // Sync projects real-time with scoped query
  useEffect(() => {
    if (!currentUser || !db) return;

    const projectsRef = collection(db, 'projects');
    const projectsQuery = isAdmin
      ? projectsRef
      : query(projectsRef, where('ownerUid', '==', currentUser.uid));

    const unsubProjects = onSnapshot(
      projectsQuery,
      (snapshot) => {
        const firestoreProjects: BioProject[] = [];
        snapshot.forEach((d) => {
          firestoreProjects.push(d.data() as BioProject);
        });

        const localProjects = loadStoredProjects(isAdmin ? undefined : currentUser.uid);
        const map = new Map<string, BioProject>();
        for (const p of localProjects) {
          const id = p.id || p.projectId;
          if (id) map.set(id, p);
        }
        for (const p of firestoreProjects) {
          const id = p.id || p.projectId;
          if (id) {
            map.set(id, {
              ...(map.get(id) || {}),
              ...p,
            });
          }
        }
        const merged = Array.from(map.values());
        setProjects(merged);
        for (const p of merged) {
          saveStoredProject(p);
        }
      },
      (err) => {
        console.warn('[Bio Fácil] Projetos Firestore (usando armazenamento local):', err);
        const localProjects = loadStoredProjects(isAdmin ? undefined : currentUser.uid);
        if (localProjects.length > 0) {
          setProjects(localProjects);
        }
      }
    );

    return () => unsubProjects();
  }, [currentUser, isAdmin]);

  // Ensure default view mode is admin for admin, or client for normal user
  useEffect(() => {
    if (isAdmin) {
      setViewMode('admin');
    } else {
      setViewMode('client');
    }
  }, [isAdmin]);

  // Admin user actions
  const handleApproveUser = async (uid: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.uid === uid ? { ...u, status: 'approved' as const } : u));
      saveStoredUsers(updated);
      return updated;
    });
    if (db) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          status: 'approved',
          approvedAt: serverTimestamp(),
          approvedBy: currentUser?.uid || 'ADMIN',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('[Bio Fácil] Status do usuário salvo localmente:', err);
      }
    }
  };

  const handleRejectUser = async (uid: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.uid === uid ? { ...u, status: 'rejected' as const } : u));
      saveStoredUsers(updated);
      return updated;
    });
    if (db) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          status: 'rejected',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('[Bio Fácil] Status do usuário salvo localmente:', err);
      }
    }
  };

  const handleBlockUser = async (uid: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.uid === uid ? { ...u, status: 'blocked' as const } : u));
      saveStoredUsers(updated);
      return updated;
    });
    if (db) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          status: 'blocked',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('[Bio Fácil] Status do usuário salvo localmente:', err);
      }
    }
  };

  const handleUnblockUser = async (uid: string) => {
    setUsers((prev) => {
      const updated = prev.map((u) => (u.uid === uid ? { ...u, status: 'approved' as const } : u));
      saveStoredUsers(updated);
      return updated;
    });
    if (db) {
      try {
        await updateDoc(doc(db, 'users', uid), {
          status: 'approved',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('[Bio Fácil] Status do usuário salvo localmente:', err);
      }
    }
  };

  // Admin template actions - Permanent save with local cache preservation
  const handleSaveImportedTemplate = async (template: BioTemplate, publishDirectly: boolean) => {
    const sanitizedData: BioTemplate = cleanForFirestore({
      ...template,
      status: publishDirectly ? 'published' : 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 1. Immediately save to persistent store so it is NEVER lost
    const updatedList = upsertStoredTemplate(sanitizedData);
    setTemplates(updatedList);

    // 2. Synchronize to Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'templates', template.templateId), {
          ...sanitizedData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (dbErr) {
        console.warn('[Bio Fácil] Modelo salvo localmente. Sincronização Firestore offline:', dbErr);
      }
    }
  };

  const handleToggleTemplateStatus = async (templateId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const target = templates.find((t) => t.templateId === templateId);
    if (target) {
      const updatedTarget: BioTemplate = { ...target, status: newStatus, updatedAt: new Date().toISOString() };
      const updatedList = upsertStoredTemplate(updatedTarget);
      setTemplates(updatedList);
    }
    if (db) {
      try {
        await updateDoc(doc(db, 'templates', templateId), {
          status: newStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('[Bio Fácil] Status do modelo alterado localmente:', err);
      }
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    const updatedList = removeStoredTemplate(templateId);
    setTemplates(updatedList);
    if (db) {
      try {
        await deleteDoc(doc(db, 'templates', templateId));
      } catch (err) {
        console.warn('[Bio Fácil] Modelo excluído localmente:', err);
      }
    }
  };

  // Client project actions - Saves only in projects/{projectId}, NEVER in templates
  const handleSaveProject = async (projectData: Partial<BioProject>): Promise<BioProject> => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    const projectId = projectData.id || projectData.projectId || `proj-${Date.now()}`;
    const projectName = projectData.projectName || projectData.name || 'Meu BioSite';
    const fullProject: BioProject = {
      id: projectId,
      projectId: projectId,
      ownerUid: currentUser.uid,
      templateId: projectData.templateId || activeEditingTemplate?.templateId || '',
      templateVersion: projectData.templateVersion || 1,
      templateName: projectData.templateName || activeEditingTemplate?.name || 'BioSite',
      nicheId: projectData.nicheId || activeEditingTemplate?.nicheId || '',
      name: projectName,
      projectName: projectName,
      values: projectData.values || {},
      theme: projectData.theme || {},
      assets: projectData.assets || {},
      links: projectData.links || {},
      createdAt: projectData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 1. Immediately persist locally (preserves user work 100%)
    saveStoredProject(fullProject);
    setProjects((prev) => {
      const idx = prev.findIndex((p) => (p.id || p.projectId) === projectId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = fullProject;
        return copy;
      }
      return [fullProject, ...prev];
    });

    // 2. Synchronize to Firestore
    if (db) {
      try {
        const sanitizedProject = cleanForFirestore({
          ...fullProject,
          updatedAt: serverTimestamp(),
        });
        await setDoc(doc(db, 'projects', projectId), sanitizedProject);
      } catch (dbErr) {
        console.warn('[Bio Fácil] Projeto salvo localmente. Sincronização Firestore offline:', dbErr);
      }
    }

    return fullProject;
  };

  const handleDuplicateProject = async (project: BioProject) => {
    if (!currentUser) return;
    const newId = `proj-${Date.now()}`;
    const duplicated: BioProject = {
      ...project,
      id: newId,
      projectId: newId,
      ownerUid: currentUser.uid,
      name: `${project.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveStoredProject(duplicated);
    setProjects((prev) => [duplicated, ...prev]);

    if (db) {
      try {
        await setDoc(doc(db, 'projects', newId), cleanForFirestore(duplicated));
      } catch (err) {
        console.warn('[Bio Fácil] Projeto duplicado localmente:', err);
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    removeStoredProject(projectId);
    setProjects((prev) => prev.filter((p) => (p.id || p.projectId) !== projectId));

    if (db) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
      } catch (err) {
        console.warn('[Bio Fácil] Projeto excluído localmente:', err);
      }
    }
  };

  // Customizer start handlers
  const handleStartCustomizingTemplate = (template: BioTemplate) => {
    setPreviewingTemplate(null);
    setActiveEditingProject(null);
    setActiveEditingTemplate(template);
  };

  const handleContinueEditingProject = (project: BioProject) => {
    const baseTemplate = templates.find((t) => t.templateId === project.templateId);
    if (baseTemplate) {
      setActiveEditingTemplate(baseTemplate);
      setActiveEditingProject(project);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#050706] flex flex-col items-center justify-center p-6 text-[#F5FFF8]">
        <div className="w-12 h-12 rounded-2xl bg-[#0B0F0D] border border-[#36FF88]/40 flex items-center justify-center text-[#36FF88] font-bold text-lg shadow-[0_0_25px_rgba(54,255,136,0.3)] mb-4 animate-bounce">
          BF
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#87938B]">
          <span className="w-3.5 h-3.5 border-2 border-[#36FF88] border-t-transparent rounded-full animate-spin"></span>
          <span>Iniciando BIO FÁCIL...</span>
        </div>
      </div>
    );
  }

  // Not signed in -> AuthScreen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#050706]">
        <AuthScreen />
        <FirebaseStatusBanner />
      </div>
    );
  }

  // Signed in but status is pending, rejected, or blocked (and not master admin)
  if (!isAdmin && userProfile?.status !== 'approved') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-[#050706]">
        <PendingApprovalScreen />
        <FirebaseStatusBanner />
      </div>
    );
  }

  // Client Editor View
  if (activeEditingTemplate) {
    return (
      <BioEditor
        template={activeEditingTemplate}
        existingProject={activeEditingProject}
        onSaveProject={handleSaveProject}
        onClose={() => {
          setActiveEditingTemplate(null);
          setActiveEditingProject(null);
        }}
      />
    );
  }

  const userProjects = projects.filter((p) => p.ownerUid === currentUser.uid);
  const pendingUsersCount = users.filter((u) => u.status === 'pending').length;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#050706] text-[#F5FFF8]">
      <div className="flex-1 flex flex-col">
        {/* Admin Navigation or Client Header */}
        {isAdmin && viewMode === 'admin' ? (
          <>
            <AdminHeader
              currentTab={adminTab}
              onTabChange={setAdminTab}
              pendingCount={pendingUsersCount}
              onSwitchToClientView={() => setViewMode('client')}
            />

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
              {templatesError && templates.length === 0 && (
                <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-between gap-3 text-red-300 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{templatesError}</span>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-red-900/50 hover:bg-red-800/60 rounded-lg text-white font-bold cursor-pointer"
                  >
                    TENTAR NOVAMENTE
                  </button>
                </div>
              )}

              {adminTab === 'overview' && (
                <AdminOverview
                  users={users}
                  templates={templates}
                  onNavigateTab={setAdminTab}
                  onApproveUser={handleApproveUser}
                  onRejectUser={handleRejectUser}
                />
              )}

              {adminTab === 'users' && (
                <AdminUsers
                  users={users}
                  onApproveUser={handleApproveUser}
                  onRejectUser={handleRejectUser}
                  onBlockUser={handleBlockUser}
                  onUnblockUser={handleUnblockUser}
                />
              )}

              {adminTab === 'templates' && (
                <AdminTemplates
                  templates={templates}
                  onToggleStatus={handleToggleTemplateStatus}
                  onDeleteTemplate={handleDeleteTemplate}
                  onNavigateImport={() => setAdminTab('import')}
                  onPreviewTemplate={(tpl) => setPreviewingTemplate(tpl)}
                />
              )}

              {adminTab === 'import' && (
                <AdminImportBioSite
                  onSaveTemplate={handleSaveImportedTemplate}
                  onCancel={() => setAdminTab('templates')}
                />
              )}

              {adminTab === 'niches' && (
                <AdminNiches
                  templates={templates}
                  onSelectNiche={() => {
                    setAdminTab('templates');
                  }}
                />
              )}

              {adminTab === 'projects' && <AdminProjects projects={projects} />}

              {adminTab === 'settings' && <AdminSettings />}
            </main>
          </>
        ) : (
          /* Client View */
          <>
            <ClientHeader
              onOpenMyProjects={() => setIsMyProjectsOpen(true)}
              onSwitchToAdmin={isAdmin ? () => setViewMode('admin') : undefined}
              myProjectsCount={userProjects.length}
            />

            <main className="flex-1">
              {templatesError && templates.length === 0 && (
                <div className="max-w-4xl mx-auto mt-6 p-4 rounded-xl bg-red-950/40 border border-red-500/40 flex items-center justify-between gap-3 text-red-300 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{templatesError}</span>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-red-900/50 hover:bg-red-800/60 rounded-lg text-white font-bold cursor-pointer"
                  >
                    TENTAR NOVAMENTE
                  </button>
                </div>
              )}

              {!selectedNiche ? (
                <NicheSelector
                  onSelectNiche={(niche) => setSelectedNiche(niche)}
                  templates={templates}
                />
              ) : (
                <NicheModelsList
                  niche={selectedNiche}
                  templates={templates}
                  onBack={() => setSelectedNiche(null)}
                  onPreview={(tpl) => setPreviewingTemplate(tpl)}
                  onCustomize={(tpl) => handleStartCustomizingTemplate(tpl)}
                />
              )}
            </main>
          </>
        )}
      </div>

      {/* Global Modals */}
      <TemplatePreviewModal
        template={previewingTemplate}
        onClose={() => setPreviewingTemplate(null)}
        onCustomize={(tpl) => handleStartCustomizingTemplate(tpl)}
      />

      <MyProjectsModal
        isOpen={isMyProjectsOpen}
        onClose={() => setIsMyProjectsOpen(false)}
        projects={userProjects}
        templates={templates}
        onContinueEditing={handleContinueEditingProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* Footer Firebase Connection Status */}
      <FirebaseStatusBanner />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
