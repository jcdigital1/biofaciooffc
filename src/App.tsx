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
} from 'firebase/firestore';
import { ensureDefaultTemplates } from './lib/initTemplates';
import { UserProfile, BioTemplate, BioProject, NicheInfo } from './types';
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

function MainApp() {
  const { currentUser, userProfile, isAdmin, isApproved, loading } = useAuth();

  // Firestore real-time collections state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [templates, setTemplates] = useState<BioTemplate[]>([]);
  const [projects, setProjects] = useState<BioProject[]>([]);

  // Navigation states
  const [viewMode, setViewMode] = useState<'admin' | 'client'>('admin');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  // Client view states
  const [selectedNiche, setSelectedNiche] = useState<NicheInfo | null>(null);
  const [previewingTemplate, setPreviewingTemplate] = useState<BioTemplate | null>(null);
  const [activeEditingTemplate, setActiveEditingTemplate] = useState<BioTemplate | null>(null);
  const [activeEditingProject, setActiveEditingProject] = useState<BioProject | null>(null);
  const [isMyProjectsOpen, setIsMyProjectsOpen] = useState(false);

  // Initialize templates non-destructively once Firebase is connected
  useEffect(() => {
    if (isFirebaseConnected && db) {
      ensureDefaultTemplates();
    }
  }, []);

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
      },
      (err) => console.warn('Erro ao escutar coleção users:', err)
    );

    return () => unsubUsers();
  }, [currentUser, isAdmin]);

  // Sync templates real-time
  useEffect(() => {
    if (!currentUser || !db) return;

    const unsubTemplates = onSnapshot(
      collection(db, 'templates'),
      (snapshot) => {
        const list: BioTemplate[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as BioTemplate);
        });
        setTemplates(list);
      },
      (err) => console.warn('Erro ao escutar coleção templates:', err)
    );

    return () => unsubTemplates();
  }, [currentUser]);

  // Sync projects real-time for current user or admin
  useEffect(() => {
    if (!currentUser || !db) return;

    const unsubProjects = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const list: BioProject[] = [];
        snapshot.forEach((d) => {
          const p = d.data() as BioProject;
          if (isAdmin || p.ownerUid === currentUser.uid) {
            list.push(p);
          }
        });
        setProjects(list);
      },
      (err) => console.warn('Erro ao escutar coleção projects:', err)
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
    if (!db) return;
    await updateDoc(doc(db, 'users', uid), {
      status: 'approved',
      approvedAt: serverTimestamp(),
      approvedBy: currentUser?.uid || 'ADMIN',
      updatedAt: serverTimestamp(),
    });
  };

  const handleRejectUser = async (uid: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'users', uid), {
      status: 'rejected',
      updatedAt: serverTimestamp(),
    });
  };

  const handleBlockUser = async (uid: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'users', uid), {
      status: 'blocked',
      updatedAt: serverTimestamp(),
    });
  };

  const handleUnblockUser = async (uid: string) => {
    if (!db) return;
    await updateDoc(doc(db, 'users', uid), {
      status: 'approved',
      updatedAt: serverTimestamp(),
    });
  };

  // Admin template actions
  const handleSaveImportedTemplate = async (template: BioTemplate, publishDirectly: boolean) => {
    if (!db) return;
    await setDoc(doc(db, 'templates', template.templateId), {
      ...template,
      status: publishDirectly ? 'published' : 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    setAdminTab('templates');
  };

  const handleToggleTemplateStatus = async (templateId: string, currentStatus: string) => {
    if (!db) return;
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    await updateDoc(doc(db, 'templates', templateId), {
      status: newStatus,
      updatedAt: serverTimestamp(),
    });
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'templates', templateId));
  };

  // Client project actions
  const handleSaveProject = async (projectData: Partial<BioProject>): Promise<BioProject> => {
    if (!db || !currentUser) throw new Error('Não autenticado');

    const projectId = projectData.id || `proj-${Date.now()}`;
    const fullProject: BioProject = {
      id: projectId,
      ownerUid: currentUser.uid,
      templateId: projectData.templateId || activeEditingTemplate?.templateId || '',
      templateVersion: projectData.templateVersion || 1,
      templateName: projectData.templateName || activeEditingTemplate?.name || '',
      nicheId: projectData.nicheId || activeEditingTemplate?.nicheId || '',
      name: projectData.name || 'Meu BioSite',
      values: projectData.values || {},
      theme: projectData.theme || {},
      assets: projectData.assets || {},
      createdAt: projectData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'projects', projectId), {
      ...fullProject,
      updatedAt: serverTimestamp(),
    });

    return fullProject;
  };

  const handleDuplicateProject = async (project: BioProject) => {
    if (!db || !currentUser) return;
    const newId = `proj-${Date.now()}`;
    const duplicated: BioProject = {
      ...project,
      id: newId,
      name: `${project.name} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'projects', newId), duplicated);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'projects', projectId));
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
                  onSelectNiche={(nicheId) => {
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
