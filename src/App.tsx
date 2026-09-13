import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Tenant,
  Workspace,
  Environment,
  UserRole,
  CanvasNode,
  ComponentDef,
  DataModel,
  Connector,
  Transform,
  PageVersion,
  AuditRecord,
  AIJob,
  DataBinding,
  Website,
  Webpage,
  AuthUser,
  StoredUserCredential,
  OneDriveConfig,
  NavigationMenuItem,
} from './types/canvas';
import {
  INITIAL_TENANTS,
  INITIAL_WORKSPACES,
  COMPONENT_REGISTRY,
  INITIAL_CONNECTORS,
  INITIAL_DATA_MODELS,
  INITIAL_TRANSFORMS,
  INITIAL_CANVAS_NODES,
  INITIAL_PAGE_VERSIONS,
  INITIAL_AUDIT_LOGS,
} from './data/initialState';
import { INITIAL_WEBSITES } from './data/initialWebsites';
import {
  INITIAL_ONEDRIVE_CONFIG,
  INITIAL_CREDENTIALS,
  syncSQLiteToOneDrive,
  hashPassword,
  generateSalt,
} from './services/sqliteOneDriveBridge';
import { safeExtractPath, runTransform } from './services/transformEngine';
import { TopNavBar, ActiveTab, CanvasMode } from './components/header/TopNavBar';
import { CanvasEditor } from './components/editor/CanvasEditor';
import { ComponentPalette } from './components/editor/ComponentPalette';
import { PropertyInspector } from './components/editor/PropertyInspector';
import { DataModelManager } from './components/datamodels/DataModelManager';
import { ConnectorManager } from './components/connectors/ConnectorManager';
import { TransformStudio } from './components/transforms/TransformStudio';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { ReleaseManager } from './components/publishing/ReleaseManager';
import { AuditLogViewer } from './components/audit/AuditLogViewer';
import { LivePagePreview } from './components/preview/LivePagePreview';
import { LoginModal } from './components/auth/LoginModal';
import { WebBundleExportModal } from './components/bundle/WebBundleExportModal';
import { OneDriveSyncModal } from './components/onedrive/OneDriveSyncModal';
import { GraphQLBridgeModal } from './components/graphql/GraphQLBridgeModal';
import { MainHomePage } from './components/home/MainHomePage';
import { UserManagementScreen } from './components/admin/UserManagementScreen';
import { DocumentationManualModal } from './components/manual/DocumentationManualModal';
import { MenuNavigationManager } from './components/websites/MenuNavigationManager';

export default function App() {
  // Tenancy & Context
  const [tenants, setTenants] = useState<Tenant[]>(INITIAL_TENANTS);
  const [activeTenant, setActiveTenant] = useState<Tenant>(INITIAL_TENANTS[0]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(INITIAL_WORKSPACES[0]);
  const [activeEnv, setActiveEnv] = useState<Environment>('development');
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>('Platform Admin');

  // Navigation Tabs & View Mode
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('draft');

  // Core Entity State
  const [componentRegistry] = useState<Record<string, ComponentDef>>(COMPONENT_REGISTRY);
  const [dataModels, setDataModels] = useState<Record<string, DataModel>>(INITIAL_DATA_MODELS);
  const [connectors, setConnectors] = useState<Connector[]>(INITIAL_CONNECTORS);
  const [transforms, setTransforms] = useState<Record<string, Transform>>(INITIAL_TRANSFORMS);
  const [pageVersions, setPageVersions] = useState<PageVersion[]>(INITIAL_PAGE_VERSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(INITIAL_AUDIT_LOGS);

  // Multi-Website & Multi-Page Management
  const [websites, setWebsites] = useState<Website[]>(() => {
    const saved = localStorage.getItem('canvas_builder_websites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved websites', e);
      }
    }
    return INITIAL_WEBSITES;
  });
  const [activeWebsiteId, setActiveWebsiteId] = useState<string>(INITIAL_WEBSITES[0].id);
  const [activePageId, setActivePageId] = useState<string>(INITIAL_WEBSITES[0].activePageId);

  // Authentication & Role
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'user-admin-1',
    email: 'admin@apexcloud.io',
    name: 'Alex Rivera (Admin)',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    lastLogin: new Date().toISOString(),
  });

  // User Credentials Vault (Zero-Knowledge, Stored in SQLite & Synced to OneDrive)
  const [storedUsers, setStoredUsers] = useState<StoredUserCredential[]>(() => {
    const saved = localStorage.getItem('canvas_stored_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved users', e);
      }
    }
    return INITIAL_CREDENTIALS;
  });

  // OneDrive & SQLite Store Config
  const [oneDriveConfig, setOneDriveConfig] = useState<OneDriveConfig>(() => {
    const saved = localStorage.getItem('canvas_onedrive_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ONEDRIVE_CONFIG;
  });

  // Active Website & Webpage computed
  const activeWebsite = useMemo(() => {
    return websites.find((w) => w.id === activeWebsiteId) || websites[0];
  }, [websites, activeWebsiteId]);

  const activePage = useMemo(() => {
    return activeWebsite.pages.find((p) => p.id === activePageId) || activeWebsite.pages[0];
  }, [activeWebsite, activePageId]);

  // Active Draft Canvas Tree (initialized from active page)
  const [draftNodes, setDraftNodes] = useState<CanvasNode[]>(activePage.nodes || INITIAL_CANVAS_NODES);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(activePage.nodes?.[0]?.id || 'node-hero-1');
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState<boolean>(true);
  const [hasUnsavedPageChanges, setHasUnsavedPageChanges] = useState<boolean>(false);

  // Modals & Navigation state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isWebBundleModalOpen, setIsWebBundleModalOpen] = useState(false);
  const [isOneDriveModalOpen, setIsOneDriveModalOpen] = useState(false);
  const [isGraphQLModalOpen, setIsGraphQLModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isHomePortalOpen, setIsHomePortalOpen] = useState(false);
  const [isAdminScreenOpen, setIsAdminScreenOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualDefaultRole, setManualDefaultRole] = useState<'admin' | 'user'>('user');
  const [isMenuManagerOpen, setIsMenuManagerOpen] = useState(false);

  // Persist websites state to localStorage
  useEffect(() => {
    localStorage.setItem('canvas_builder_websites', JSON.stringify(websites));
  }, [websites]);

  // Persist stored users to localStorage
  useEffect(() => {
    localStorage.setItem('canvas_stored_users', JSON.stringify(storedUsers));
  }, [storedUsers]);

  // Persist OneDrive config
  useEffect(() => {
    localStorage.setItem('canvas_onedrive_config', JSON.stringify(oneDriveConfig));
  }, [oneDriveConfig]);

  // Sidebar visibility toggles for expansive SaaS view
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(true);
  const [isInspectorOpen, setIsInspectorOpen] = useState<boolean>(true);

  // Append to Audit Trail helper
  const recordAudit = useCallback(
    (
      actor_type: 'user' | 'system' | 'ai',
      action: string,
      entity_type: 'page' | 'component' | 'data_model' | 'connector' | 'transform' | 'ai_job' | 'version',
      entity_id: string,
      summary: string,
      reviewed_by?: string
    ) => {
      const newRecord: AuditRecord = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        tenant_id: activeTenant.id,
        actor_type,
        actor_name: actor_type === 'ai' ? 'Canvas AI Copilot' : actor_type === 'system' ? 'System Scheduler' : 'Alex Rivera',
        action,
        entity_type,
        entity_id,
        summary,
        created_at: new Date().toISOString(),
        reviewed_by,
      };
      setAuditLogs((prev) => [newRecord, ...prev]);
    },
    [activeTenant.id]
  );

  // Current published version
  const currentPublished = useMemo(
    () => pageVersions.find((v) => v.status === 'published') || pageVersions[1],
    [pageVersions]
  );

  // Active nodes depending on canvas mode (Draft vs Published)
  const activeDisplayNodes = useMemo(() => {
    if (canvasMode === 'published') {
      return currentPublished.layout_tree;
    }
    return draftNodes;
  }, [canvasMode, currentPublished, draftNodes]);

  // Resolve dynamic bindings into resolved props for all components
  const resolvedPropsMap = useMemo(() => {
    const map: Record<string, Record<string, any>> = {};

    // Helper map of connector sample data
    const connectorDataMap: Record<string, any> = {};
    for (const c of connectors) {
      connectorDataMap[c.id] = c.sample_data;
    }

    const resolveNode = (node: CanvasNode) => {
      const resolved: Record<string, any> = { ...node.props };

      if (node.bindings) {
        for (const [propKey, binding] of Object.entries(node.bindings)) {
          const model = dataModels[binding.modelId];
          if (!model) continue;

          const rawData = connectorDataMap[model.connector_id];
          if (rawData) {
            // Extract raw field path
            let extracted = safeExtractPath(rawData, binding.fieldPath);

            // If a transform is attached, evaluate it
            if (binding.transformId && transforms[binding.transformId]) {
              const transformRes = runTransform(transforms[binding.transformId], extracted);
              if (transformRes.success) {
                extracted = transformRes.output;
              }
            }

            if (extracted !== undefined) {
              resolved[propKey] = extracted;
            }
          }
        }
      }

      map[node.id] = resolved;

      if (node.children) {
        node.children.forEach(resolveNode);
      }
    };

    activeDisplayNodes.forEach(resolveNode);
    return map;
  }, [activeDisplayNodes, connectors, dataModels, transforms]);

  // Find currently selected node in draft
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    const findNode = (list: CanvasNode[]): CanvasNode | null => {
      for (const n of list) {
        if (n.id === selectedNodeId) return n;
        if (n.children) {
          const found = findNode(n.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findNode(draftNodes);
  }, [selectedNodeId, draftNodes]);

  // Canvas Actions
  const handleAddComponent = (compDef: ComponentDef) => {
    const newNode: CanvasNode = {
      id: `node-${Date.now()}`,
      componentId: compDef.id,
      name: compDef.name,
      variant: compDef.variants[0] || 'default',
      props: Object.fromEntries(
        Object.entries(compDef.prop_schema).map(([k, def]) => [k, def.default ?? ''])
      ),
      bindings: {},
      children: compDef.slots.length > 0 ? [] : undefined,
    };

    // If a container node like KPI Grid is selected and has children, insert into it
    if (selectedNode && selectedNode.componentId === 'kpi_grid_section') {
      setDraftNodes((prev) =>
        prev.map((n) => {
          if (n.id === selectedNode.id) {
            return { ...n, children: [...(n.children || []), newNode] };
          }
          return n;
        })
      );
    } else {
      setDraftNodes((prev) => [...prev, newNode]);
    }

    setSelectedNodeId(newNode.id);
    setHasUnpublishedChanges(true);
    recordAudit('user', 'component.insert', 'component', newNode.id, `Added ${compDef.name} component to canvas draft.`);
  };

  const handleDeleteNode = (nodeId: string) => {
    setDraftNodes((prev) => {
      // Filter from top level or children
      const removeRecursive = (list: CanvasNode[]): CanvasNode[] =>
        list
          .filter((n) => n.id !== nodeId)
          .map((n) => (n.children ? { ...n, children: removeRecursive(n.children) } : n));
      return removeRecursive(prev);
    });

    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
    setHasUnpublishedChanges(true);
    recordAudit('user', 'component.delete', 'component', nodeId, 'Removed component node from canvas draft.');
  };

  const handleDuplicateNode = (nodeId: string) => {
    const dupRecursive = (list: CanvasNode[]): CanvasNode[] => {
      const res: CanvasNode[] = [];
      for (const n of list) {
        res.push(n);
        if (n.id === nodeId) {
          res.push({
            ...JSON.parse(JSON.stringify(n)),
            id: `node-${Date.now()}`,
            name: `${n.name || n.componentId} (Copy)`,
          });
        }
        if (n.children) {
          n.children = dupRecursive(n.children);
        }
      }
      return res;
    };

    setDraftNodes((prev) => dupRecursive(prev));
    setHasUnpublishedChanges(true);
    recordAudit('user', 'component.duplicate', 'component', nodeId, 'Duplicated component node in canvas draft.');
  };

  const handleMoveNode = (nodeId: string, direction: 'up' | 'down') => {
    setDraftNodes((prev) => {
      const idx = prev.findIndex((n) => n.id === nodeId);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, item);
      return copy;
    });
    setHasUnpublishedChanges(true);
  };

  const handleUpdateProp = (nodeId: string, propKey: string, value: any) => {
    setDraftNodes((prev) => {
      const updateRecursive = (list: CanvasNode[]): CanvasNode[] =>
        list.map((n) => {
          if (n.id === nodeId) {
            return { ...n, props: { ...n.props, [propKey]: value } };
          }
          if (n.children) {
            return { ...n, children: updateRecursive(n.children) };
          }
          return n;
        });
      return updateRecursive(prev);
    });
    setHasUnpublishedChanges(true);
  };

  const handleUpdateVariant = (nodeId: string, variant: string) => {
    setDraftNodes((prev) => {
      const updateRecursive = (list: CanvasNode[]): CanvasNode[] =>
        list.map((n) => {
          if (n.id === nodeId) return { ...n, variant };
          if (n.children) return { ...n, children: updateRecursive(n.children) };
          return n;
        });
      return updateRecursive(prev);
    });
    setHasUnpublishedChanges(true);
  };

  const handleUpdateName = (nodeId: string, name: string) => {
    setDraftNodes((prev) => {
      const updateRecursive = (list: CanvasNode[]): CanvasNode[] =>
        list.map((n) => {
          if (n.id === nodeId) return { ...n, name };
          if (n.children) return { ...n, children: updateRecursive(n.children) };
          return n;
        });
      return updateRecursive(prev);
    });
    setHasUnpublishedChanges(true);
  };

  const handleBindProp = (nodeId: string, propKey: string, binding: DataBinding) => {
    setDraftNodes((prev) => {
      const updateRecursive = (list: CanvasNode[]): CanvasNode[] =>
        list.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              bindings: { ...n.bindings, [propKey]: binding },
            };
          }
          if (n.children) {
            return { ...n, children: updateRecursive(n.children) };
          }
          return n;
        });
      return updateRecursive(prev);
    });
    setHasUnpublishedChanges(true);
    recordAudit(
      'user',
      'binding.create',
      'component',
      nodeId,
      `Bound prop "${propKey}" to ${binding.modelId}.${binding.fieldPath}`
    );
  };

  const handleUnbindProp = (nodeId: string, propKey: string) => {
    setDraftNodes((prev) => {
      const updateRecursive = (list: CanvasNode[]): CanvasNode[] =>
        list.map((n) => {
          if (n.id === nodeId && n.bindings) {
            const nextBindings = { ...n.bindings };
            delete nextBindings[propKey];
            return { ...n, bindings: nextBindings };
          }
          if (n.children) {
            return { ...n, children: updateRecursive(n.children) };
          }
          return n;
        });
      return updateRecursive(prev);
    });
    setHasUnpublishedChanges(true);
    setHasUnsavedPageChanges(true);
    recordAudit('user', 'binding.remove', 'component', nodeId, `Unbound prop "${propKey}".`);
  };

  // Multi-Website and Webpage Management Handlers
  const handleSelectWebsite = (siteId: string) => {
    const site = websites.find((w) => w.id === siteId);
    if (!site) return;
    setActiveWebsiteId(siteId);
    const targetPage = site.pages[0];
    if (targetPage) {
      setActivePageId(targetPage.id);
      setDraftNodes(targetPage.nodes || []);
      setSelectedNodeId(targetPage.nodes?.[0]?.id || null);
    }
    setHasUnsavedPageChanges(false);
    recordAudit('user', 'website.switch', 'page', siteId, `Switched to website "${site.name}".`);
  };

  const handleSelectPage = (pageId: string) => {
    const page = activeWebsite.pages.find((p) => p.id === pageId);
    if (!page) return;
    setActivePageId(pageId);
    setDraftNodes(page.nodes || []);
    setSelectedNodeId(page.nodes?.[0]?.id || null);
    setHasUnsavedPageChanges(false);
    recordAudit('user', 'page.switch', 'page', pageId, `Switched to webpage "/${page.slug}" (${page.title}).`);
  };

  const handleCreateWebsite = (newSite: Website) => {
    setWebsites((prev) => [...prev, newSite]);
    setActiveWebsiteId(newSite.id);
    const firstPage = newSite.pages[0];
    if (firstPage) {
      setActivePageId(firstPage.id);
      setDraftNodes(firstPage.nodes || []);
      setSelectedNodeId(firstPage.nodes?.[0]?.id || null);
    }
    setHasUnsavedPageChanges(false);
    recordAudit('user', 'website.create', 'page', newSite.id, `Created new website "${newSite.name}".`);
  };

  const handleCreatePage = (siteId: string, newPage: Webpage) => {
    setWebsites((prev) =>
      prev.map((site) => {
        if (site.id === siteId) {
          return {
            ...site,
            pages: [...site.pages, newPage],
            updatedAt: new Date().toISOString(),
          };
        }
        return site;
      })
    );
    setActivePageId(newPage.id);
    setDraftNodes(newPage.nodes || []);
    setSelectedNodeId(newPage.nodes?.[0]?.id || null);
    setHasUnsavedPageChanges(false);
    recordAudit('user', 'page.create', 'page', newPage.id, `Created new webpage "/${newPage.slug}" in "${activeWebsite.name}".`);
  };

  const handleSaveCurrentPage = async () => {
    const updatedWebsites = websites.map((site) => {
      if (site.id === activeWebsiteId) {
        return {
          ...site,
          pages: site.pages.map((p) => {
            if (p.id === activePageId) {
              return {
                ...p,
                nodes: draftNodes,
                updatedAt: new Date().toISOString(),
              };
            }
            return p;
          }),
          updatedAt: new Date().toISOString(),
        };
      }
      return site;
    });

    setWebsites(updatedWebsites);
    setHasUnsavedPageChanges(false);

    // Project-specific OneDrive save path!
    const targetFolder = activeWebsite.oneDriveFolder || `/Apps/CanvasStudio/Projects/${activeWebsite.id}/`;
    if (oneDriveConfig.isConnected && oneDriveConfig.autoSync) {
      try {
        const syncResult = await syncSQLiteToOneDrive(
          { ...oneDriveConfig, folderPath: targetFolder },
          updatedWebsites,
          storedUsers
        );
        setOneDriveConfig((prev) => ({
          ...prev,
          lastSyncedAt: syncResult.syncedAt,
          syncStatus: 'synced',
          dbSizeBytes: syncResult.byteSize,
        }));
      } catch (err) {
        console.error('OneDrive project auto-sync error:', err);
      }
    }

    recordAudit(
      'user',
      'page.save',
      'page',
      activePageId,
      `Saved webpage "${activePage.title}" (${draftNodes.length} sections) to project folder "${targetFolder}".`
    );
  };

  // Menu items updater for active website
  const handleSaveMenuItems = (items: NavigationMenuItem[]) => {
    const updatedWebsites = websites.map((site) => {
      if (site.id === activeWebsiteId) {
        return {
          ...site,
          menuItems: items,
          updatedAt: new Date().toISOString(),
        };
      }
      return site;
    });
    setWebsites(updatedWebsites);
    recordAudit(
      'user',
      'navigation.update',
      'page',
      activeWebsiteId,
      `Updated navigation menu (${items.length} links) for website "${activeWebsite.name}".`
    );
  };

  // User Management Admin Console Handlers
  const handleUpdateUserRole = (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    const updated = storedUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
    setStoredUsers(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, role: newRole });
      setCurrentUserRole(newRole === 'admin' ? 'Platform Admin' : 'Editor');
    }
    recordAudit('user', 'user.role_change', 'page', userId, `Updated user role to ${newRole}`);
  };

  const handleAddUser = (newUser: StoredUserCredential) => {
    const updated = [...storedUsers, newUser];
    setStoredUsers(updated);
    recordAudit(
      'user',
      'user.provision',
      'page',
      newUser.id,
      `Provisioned account for ${newUser.name} (${newUser.email}) with ${newUser.projectGrants?.length || 0} project grants.`
    );
  };

  const handleDeleteUser = (userId: string) => {
    const updated = storedUsers.filter((u) => u.id !== userId);
    setStoredUsers(updated);
    recordAudit('user', 'user.delete', 'page', userId, `Deleted user ${userId} from credential vault.`);
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    const salt = generateSalt(16);
    const passwordHash = await hashPassword(newPassword, salt);
    const updated = storedUsers.map((u) =>
      u.id === userId ? { ...u, passwordHash, passwordSalt: salt } : u
    );
    setStoredUsers(updated);
    if (oneDriveConfig.isConnected) {
      await syncSQLiteToOneDrive(oneDriveConfig, websites, updated);
    }
    recordAudit('user', 'user.password_reset', 'page', userId, `Reset password for user ${userId} with new 128-bit salt and SHA-256 hash.`);
  };

  const handleUpdateUserGrants = (userId: string, projectIds: string[]) => {
    const updated = storedUsers.map((u) =>
      u.id === userId ? { ...u, projectGrants: projectIds } : u
    );
    setStoredUsers(updated);
    recordAudit(
      'user',
      'user.grants_update',
      'page',
      userId,
      `Updated project access grants (${projectIds.length} projects) for user ${userId}.`
    );
  };

  const handleForceSyncOneDrive = async () => {
    try {
      const syncResult = await syncSQLiteToOneDrive(oneDriveConfig, websites, storedUsers);
      setOneDriveConfig((prev) => ({
        ...prev,
        lastSyncedAt: syncResult.syncedAt,
        syncStatus: 'synced',
        dbSizeBytes: syncResult.byteSize,
      }));
    } catch (err) {
      console.error('Failed to force sync OneDrive', err);
    }
  };

  // User Registration with Salted SHA-256 password stored in OneDrive SQLite vault
  const handleRegisterUser = async (data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'editor';
  }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (storedUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with this email address already exists in the credential vault.');
    }

    // Cryptographic 128-bit salt + SHA-256 hash
    const salt = generateSalt(16);
    const passwordHash = await hashPassword(data.password, salt);

    const newUser: StoredUserCredential = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: data.name.trim(),
      role: data.role,
      passwordHash,
      passwordSalt: salt,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      syncedToOneDrive: true,
      oneDrivePath: `${oneDriveConfig.folderPath}${oneDriveConfig.sqliteFileName}`,
    };

    const updatedUsers = [...storedUsers, newUser];
    setStoredUsers(updatedUsers);

    // Sync credentials to OneDrive SQLite vault
    if (oneDriveConfig.isConnected) {
      try {
        const syncResult = await syncSQLiteToOneDrive(oneDriveConfig, websites, updatedUsers);
        setOneDriveConfig((prev) => ({
          ...prev,
          lastSyncedAt: syncResult.syncedAt,
          syncStatus: 'synced',
          dbSizeBytes: syncResult.byteSize,
        }));
      } catch (err) {
        console.error('OneDrive user credentials sync error:', err);
      }
    }

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      token: `jwt-${newUser.id}-${Date.now()}`,
    };
    setCurrentUser(authUser);
    setCurrentUserRole(newUser.role === 'admin' ? 'Platform Admin' : 'Editor');

    recordAudit(
      'user',
      'user.register',
      'page',
      newUser.id,
      `New user registered: ${newUser.name} (${newUser.role}). Salted SHA-256 credentials securely saved to OneDrive SQLite vault (${oneDriveConfig.sqliteFileName}).`
    );
  };

  // User Login Verification against Salted SHA-256 stored in OneDrive vault
  const handleVerifyLogin = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check stored user vault first
    const foundUser = storedUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (foundUser) {
      if (password) {
        const computedHash = await hashPassword(password, foundUser.passwordSalt);
        if (computedHash !== foundUser.passwordHash) {
          throw new Error('Incorrect password. The salted SHA-256 hash does not match the OneDrive SQLite credential.');
        }
      }

      // Update lastLogin timestamp
      const updatedUsers = storedUsers.map((u) =>
        u.id === foundUser.id ? { ...u, lastLogin: new Date().toISOString() } : u
      );
      setStoredUsers(updatedUsers);

      const authUser: AuthUser = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        token: `jwt-${foundUser.id}-${Date.now()}`,
      };
      setCurrentUser(authUser);
      setCurrentUserRole(foundUser.role === 'admin' ? 'Platform Admin' : 'Editor');
      recordAudit('user', 'user.login', 'page', foundUser.id, `User authenticated as ${foundUser.name} (${foundUser.role}).`);
      return;
    }

    // Built-in presets fallback
    if (cleanEmail === 'admin@apexcloud.io') {
      const authUser: AuthUser = {
        id: 'user-admin-1',
        email: 'admin@apexcloud.io',
        name: 'System Administrator',
        role: 'admin',
        token: 'jwt-admin-token',
      };
      setCurrentUser(authUser);
      setCurrentUserRole('Platform Admin');
      recordAudit('user', 'user.login', 'page', 'user-admin-1', 'System Administrator logged in.');
      return;
    }
    if (cleanEmail === 'builder@apexcloud.io') {
      const authUser: AuthUser = {
        id: 'user-builder-2',
        email: 'builder@apexcloud.io',
        name: 'Alex Vance (Builder)',
        role: 'editor',
        token: 'jwt-builder-token',
      };
      setCurrentUser(authUser);
      setCurrentUserRole('Editor');
      recordAudit('user', 'user.login', 'page', 'user-builder-2', 'Alex Vance (Builder) logged in.');
      return;
    }

    throw new Error('Account not found. Please check your email or use Register Account to create one.');
  };

  // AI Proposal Acceptance and Rejection
  const handleAcceptAIProposal = (job: AIJob) => {
    if (job.proposal.changes.diffNodes) {
      setDraftNodes(job.proposal.changes.diffNodes);
    } else if (job.proposal.changes.diffBindings && selectedNodeId) {
      setDraftNodes((prev) => {
        const updateRecursive = (list: CanvasNode[]): CanvasNode[] =>
          list.map((n) => {
            if (n.id === selectedNodeId) {
              return {
                ...n,
                bindings: { ...n.bindings, ...job.proposal.changes.diffBindings },
              };
            }
            if (n.children) return { ...n, children: updateRecursive(n.children) };
            return n;
          });
        return updateRecursive(prev);
      });
    } else if (job.proposal.changes.newTransform) {
      setTransforms((prev) => ({
        ...prev,
        [job.proposal.changes.newTransform!.id]: job.proposal.changes.newTransform!,
      }));
    }

    setHasUnpublishedChanges(true);
    recordAudit(
      'ai',
      'ai_job.accepted',
      'ai_job',
      job.id,
      `AI Proposal "${job.proposal.title}" accepted and applied to canvas draft.`,
      'Alex Rivera (Builder)'
    );
  };

  const handleRejectAIProposal = (job: AIJob, reason: string) => {
    recordAudit(
      'ai',
      'ai_job.rejected',
      'ai_job',
      job.id,
      `AI Proposal "${job.proposal.title}" rejected. Reason: ${reason}`,
      'Alex Rivera (Builder)'
    );
  };

  // Publish Release Flow
  const handlePublishVersion = (changelog: string) => {
    const currentNum = currentPublished.version_number; // e.g. "v1.2.0"
    const match = currentNum.match(/^v(\d+)\.(\d+)\.(\d+)$/);
    const nextVersionNum = match
      ? `v${match[1]}.${parseInt(match[2], 10) + 1}.0`
      : `v1.3.0`;

    const newVersion: PageVersion = {
      id: `pv-${Date.now()}`,
      page_id: 'page-exec-cmd',
      version_number: nextVersionNum,
      status: 'published',
      layout_tree: JSON.parse(JSON.stringify(draftNodes)),
      created_by: 'Alex Rivera (Builder)',
      created_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      published_by: 'Alex Rivera (Builder)',
      changelog,
      cdn_artifact_hash: `cdn.canvas.io/artifacts/apex/${nextVersionNum}/render-${Math.random().toString(36).substring(2, 8)}.json`,
    };

    // Mark previous published versions as archived
    setPageVersions((prev) => [
      newVersion,
      ...prev.map((v) => (v.status === 'published' ? { ...v, status: 'archived' as const } : v)),
    ]);

    setHasUnpublishedChanges(false);
    recordAudit(
      'user',
      'version.publish',
      'version',
      newVersion.id,
      `Promoted immutable release ${newVersion.version_number} to Production CDN edge.`
    );
  };

  // 1-Click Rollback Flow
  const handleRollbackToVersion = (targetVersion: PageVersion) => {
    // Re-point published pointer & draft layout to this version instantaneously
    setDraftNodes(JSON.parse(JSON.stringify(targetVersion.layout_tree)));
    setPageVersions((prev) =>
      prev.map((v) => {
        if (v.id === targetVersion.id) return { ...v, status: 'published' as const };
        if (v.status === 'published') return { ...v, status: 'archived' as const };
        return v;
      })
    );

    setHasUnpublishedChanges(false);
    recordAudit(
      'user',
      'version.rollback',
      'version',
      targetVersion.id,
      `Executed instantaneous rollback to immutable release ${targetVersion.version_number}.`
    );
  };

  // Connector sync trigger
  const handleTriggerConnectorSync = (connectorId: string) => {
    setConnectors((prev) =>
      prev.map((c) => {
        if (c.id === connectorId) {
          return {
            ...c,
            last_sync_at: new Date().toISOString(),
            latency_ms: Math.floor(Math.random() * 30) + 12,
          };
        }
        return c;
      })
    );
    recordAudit('system', 'connector.sync', 'connector', connectorId, 'Ingested live snapshot from data connector.');
  };

  if (isHomePortalOpen) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased flex flex-col">
        <MainHomePage
          currentUser={currentUser}
          storedUsers={storedUsers}
          websites={websites}
          onLogin={handleVerifyLogin}
          onRegister={handleRegisterUser}
          onEnterStudio={() => setIsHomePortalOpen(false)}
          onOpenUserManagement={() => {
            setIsHomePortalOpen(false);
            setIsAdminScreenOpen(true);
          }}
          onOpenManual={(role) => {
            setManualDefaultRole(role);
            setIsManualModalOpen(true);
          }}
          onSelectWebsite={(siteId) => {
            handleSelectWebsite(siteId);
            setIsHomePortalOpen(false);
          }}
        />
        <DocumentationManualModal
          isOpen={isManualModalOpen}
          defaultRole={manualDefaultRole}
          onClose={() => setIsManualModalOpen(false)}
        />
      </div>
    );
  }

  if (isAdminScreenOpen) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans antialiased flex flex-col">
        <UserManagementScreen
          currentUser={currentUser}
          users={storedUsers}
          websites={websites}
          oneDriveConfig={oneDriveConfig}
          onUpdateUserRole={handleUpdateUserRole}
          onAddUser={handleAddUser}
          onDeleteUser={handleDeleteUser}
          onResetPassword={handleResetPassword}
          onUpdateUserGrants={handleUpdateUserGrants}
          onForceSyncOneDrive={handleForceSyncOneDrive}
          onBackToStudio={() => setIsAdminScreenOpen(false)}
        />
        <DocumentationManualModal
          isOpen={isManualModalOpen}
          defaultRole={manualDefaultRole}
          onClose={() => setIsManualModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* Top Application Header */}
      <TopNavBar
        tenants={tenants}
        activeTenant={activeTenant}
        onSelectTenant={setActiveTenant}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        onSelectWorkspace={setActiveWorkspace}
        activeEnv={activeEnv}
        onSelectEnv={setActiveEnv}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        canvasMode={canvasMode}
        onSelectCanvasMode={setCanvasMode}
        currentUserRole={currentUserRole}
        onChangeUserRole={setCurrentUserRole}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onPublishClick={() => setActiveTab('releases')}
        hasUnpublishedChanges={hasUnpublishedChanges}
        publishedVersionNumber={currentPublished.version_number}

        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenWebBundleModal={() => setIsWebBundleModalOpen(true)}
        onOpenOneDriveModal={() => setIsOneDriveModalOpen(true)}
        onOpenGraphQLModal={() => setIsGraphQLModalOpen(true)}
        onOpenUserManagement={() => setIsAdminScreenOpen(true)}
        onOpenManual={(role) => {
          setManualDefaultRole(role);
          setIsManualModalOpen(true);
        }}
        onOpenMenuManager={() => setIsMenuManagerOpen(true)}
        onOpenHome={() => setIsHomePortalOpen(true)}
        oneDriveConfig={oneDriveConfig}
        websites={websites}
        activeWebsiteId={activeWebsiteId}
        activePageId={activePageId}
        onSelectWebsite={handleSelectWebsite}
        onSelectPage={handleSelectPage}
        onCreateWebsite={handleCreateWebsite}
        onCreatePage={handleCreatePage}
        onSaveCurrentPage={handleSaveCurrentPage}
        hasUnsavedPageChanges={hasUnsavedPageChanges}
      />

      {/* Main Module Content Views */}
      <main className="flex-1 flex overflow-hidden">
        {/* TAB: VISUAL CANVAS */}
        {activeTab === 'editor' && (
          <>
            {canvasMode === 'draft' ? (
              <div className="flex-1 flex overflow-hidden relative">
                {/* Left: Component Registry Palette */}
                {isPaletteOpen && (
                  <ComponentPalette
                    registry={componentRegistry}
                    onAddComponent={handleAddComponent}
                  />
                )}

                {/* Center: Responsive Canvas Viewport */}
                <CanvasEditor
                  nodes={draftNodes}
                  componentRegistry={componentRegistry}
                  dataModels={dataModels}
                  transforms={transforms}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  onDeleteNode={handleDeleteNode}
                  onDuplicateNode={handleDuplicateNode}
                  onMoveNode={handleMoveNode}
                  resolvedPropsMap={resolvedPropsMap}
                  activeEnv={activeEnv}
                  onOpenAI={() => setIsAIModalOpen(true)}
                  onQuickInsert={() =>
                    handleAddComponent(
                      componentRegistry['feature_grid_saas'] ||
                        componentRegistry['pricing_table_saas'] ||
                        Object.values(componentRegistry)[0]
                    )
                  }
                />

                {/* Right: Property Inspector */}
                {isInspectorOpen && (
                  <PropertyInspector
                    selectedNode={selectedNode}
                    compDef={selectedNode ? componentRegistry[selectedNode.componentId] : undefined}
                    dataModels={dataModels}
                    transforms={transforms}
                    resolvedProps={selectedNode ? resolvedPropsMap[selectedNode.id] || selectedNode.props : {}}
                    onUpdateProp={handleUpdateProp}
                    onUpdateVariant={handleUpdateVariant}
                    onUpdateName={handleUpdateName}
                    onBindProp={handleBindProp}
                    onUnbindProp={handleUnbindProp}
                  />
                )}
              </div>
            ) : (
              /* Live Preview or Published View */
              <LivePagePreview
                nodes={activeDisplayNodes}
                componentRegistry={componentRegistry}
                resolvedPropsMap={resolvedPropsMap}
                isPublishedView={canvasMode === 'published'}
                versionNumber={canvasMode === 'published' ? currentPublished.version_number : 'v1.2.1-draft'}
                website={activeWebsite}
                activePageId={activePageId}
                onNavigateToPage={handleSelectPage}
                onBackToEditor={() => setCanvasMode('draft')}
                onRefreshData={() => handleTriggerConnectorSync('conn-pg-1')}
              />
            )}
          </>
        )}

        {/* TAB: DATA MODEL REGISTRY */}
        {activeTab === 'data-models' && (
          <DataModelManager
            dataModels={dataModels}
            connectors={connectors}
            onCreateModel={(newModel) => {
              setDataModels((prev) => ({ ...prev, [newModel.id]: newModel }));
              recordAudit('user', 'data_model.create', 'data_model', newModel.id, `Created data model "${newModel.name}".`);
            }}
            onUpdateModel={(updated) => {
              setDataModels((prev) => ({ ...prev, [updated.id]: updated }));
            }}
          />
        )}

        {/* TAB: CONNECTORS & SYNC */}
        {activeTab === 'connectors' && (
          <ConnectorManager
            connectors={connectors}
            onTriggerSync={handleTriggerConnectorSync}
            onAddConnector={(c) => {
              setConnectors((prev) => [...prev, c]);
              recordAudit('user', 'connector.register', 'connector', c.id, `Registered connector "${c.name}".`);
            }}
          />
        )}

        {/* TAB: TRANSFORM STUDIO */}
        {activeTab === 'transforms' && (
          <TransformStudio
            transforms={transforms}
            onCreateTransform={(t) => {
              setTransforms((prev) => ({ ...prev, [t.id]: t }));
              recordAudit('user', 'transform.create', 'transform', t.id, `Created transform pipeline "${t.name}".`);
            }}
            onUpdateTransform={(t) => {
              setTransforms((prev) => ({ ...prev, [t.id]: t }));
              recordAudit('user', 'transform.update', 'transform', t.id, `Updated transform pipeline "${t.name}".`);
            }}
          />
        )}

        {/* TAB: RELEASES & ROLLBACK */}
        {activeTab === 'releases' && (
          <ReleaseManager
            pageVersions={pageVersions}
            currentDraftNodes={draftNodes}
            componentRegistry={componentRegistry}
            dataModels={dataModels}
            resolvedPropsMap={resolvedPropsMap}
            onPublishVersion={handlePublishVersion}
            onRollbackToVersion={handleRollbackToVersion}
          />
        )}

        {/* TAB: AUDIT LOG */}
        {activeTab === 'audit' && <AuditLogViewer logs={auditLogs} />}
      </main>

      {/* AI Assistant & Human Review Diff Modal */}
      <AIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        currentNodes={draftNodes}
        componentRegistry={componentRegistry}
        dataModels={dataModels}
        selectedNodeId={selectedNodeId}
        onAcceptProposal={handleAcceptAIProposal}
        onRejectProposal={handleRejectAIProposal}
      />

      {/* Authentication & Role Switcher Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        currentUser={currentUser}
        storedUsers={storedUsers}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleVerifyLogin}
        onRegister={handleRegisterUser}
        onLogout={() => {
          recordAudit('user', 'user.logout', 'page', currentUser?.id || 'anonymous', 'User logged out.');
          setCurrentUser(null);
        }}
      />

      {/* Export Runnable Node.js Web Bundle Modal */}
      <WebBundleExportModal
        isOpen={isWebBundleModalOpen}
        website={activeWebsite}
        onClose={() => setIsWebBundleModalOpen(false)}
      />

      {/* OneDrive & SQLite Dynamic Storage Modal */}
      <OneDriveSyncModal
        isOpen={isOneDriveModalOpen}
        currentUser={currentUser}
        config={oneDriveConfig}
        websites={websites}
        users={storedUsers}
        onClose={() => setIsOneDriveModalOpen(false)}
        onUpdateConfig={(newConfig) => {
          setOneDriveConfig(newConfig);
          recordAudit('user', 'onedrive.config', 'page', 'onedrive', 'Updated OneDrive SQLite storage settings.');
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Interactive GraphQL Bridge Modal */}
      <GraphQLBridgeModal
        isOpen={isGraphQLModalOpen}
        website={activeWebsite}
        onClose={() => setIsGraphQLModalOpen(false)}
      />

      {/* Navigation Menu Linker Modal */}
      <MenuNavigationManager
        isOpen={isMenuManagerOpen}
        website={activeWebsite}
        onClose={() => setIsMenuManagerOpen(false)}
        onSaveMenuItems={handleSaveMenuItems}
        onNavigateToPage={(pageId) => {
          handleSelectPage(pageId);
          setIsMenuManagerOpen(false);
        }}
      />

      {/* User & Admin Documentation Manual Modal */}
      <DocumentationManualModal
        isOpen={isManualModalOpen}
        defaultRole={manualDefaultRole}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
}
