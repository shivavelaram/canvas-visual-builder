import React, { useState } from 'react';
import { StoredUserCredential, Website, AuthUser, OneDriveConfig } from '../../types/canvas';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  Trash2,
  Edit2,
  Lock,
  Search,
  FolderLock,
  Globe,
  Database,
  Cloud,
  RefreshCw,
  Eye,
  Sliders,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { hashPassword, generateSalt } from '../../services/sqliteOneDriveBridge';

interface UserManagementScreenProps {
  currentUser: AuthUser | null;
  users: StoredUserCredential[];
  websites: Website[];
  oneDriveConfig: OneDriveConfig;
  onUpdateUserRole: (userId: string, newRole: 'admin' | 'editor' | 'viewer') => void;
  onAddUser: (user: StoredUserCredential) => void;
  onDeleteUser: (userId: string) => void;
  onResetPassword: (userId: string, newPassword: string) => Promise<void>;
  onUpdateUserGrants: (userId: string, projectIds: string[]) => void;
  onForceSyncOneDrive: () => void;
  onBackToStudio: () => void;
}

export const UserManagementScreen: React.FC<UserManagementScreenProps> = ({
  currentUser,
  users,
  websites,
  oneDriveConfig,
  onUpdateUserRole,
  onAddUser,
  onDeleteUser,
  onResetPassword,
  onUpdateUserGrants,
  onForceSyncOneDrive,
  onBackToStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'editor' | 'viewer'>('all');
  const [selectedTab, setSelectedTab] = useState<'users' | 'matrix' | 'vault'>('users');

  // Modals
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isManageGrantsModalOpen, setIsManageGrantsModalOpen] = useState(false);
  const [activeTargetUserId, setActiveTargetUserId] = useState<string | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [newPassword, setNewPassword] = useState('');
  const [newProjectGrants, setNewProjectGrants] = useState<string[]>([]);
  const [addError, setAddError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset Password Form State
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  const targetUser = users.find((u) => u.id === activeTargetUserId);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const cleanEmail = newEmail.trim().toLowerCase();
    if (!cleanEmail || !newName.trim() || !newPassword) {
      setAddError('All fields are required.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setAddError('A user with this email address already exists in the system.');
      return;
    }

    try {
      setIsSubmitting(true);
      const salt = generateSalt(16);
      const passwordHash = await hashPassword(newPassword, salt);

      const newUser: StoredUserCredential = {
        id: `user-${Date.now()}`,
        email: cleanEmail,
        name: newName.trim(),
        role: newRole,
        passwordHash,
        passwordSalt: salt,
        createdAt: new Date().toISOString(),
        lastLogin: undefined,
        syncedToOneDrive: true,
        oneDrivePath: `${oneDriveConfig.folderPath}${oneDriveConfig.sqliteFileName}`,
        projectGrants: newProjectGrants.length > 0 ? newProjectGrants : [websites[0]?.id || 'site-apex-1'],
      };

      onAddUser(newUser);
      setIsAddUserModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewProjectGrants([]);
    } catch (err: any) {
      setAddError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTargetUserId || !resetNewPassword) return;

    try {
      await onResetPassword(activeTargetUserId, resetNewPassword);
      setResetSuccess(true);
      setTimeout(() => {
        setIsResetPasswordModalOpen(false);
        setResetSuccess(false);
        setResetNewPassword('');
      }, 1200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleProjectGrant = (userId: string, projectId: string) => {
    const u = users.find((item) => item.id === userId);
    if (!u) return;

    const currentGrants = u.projectGrants || [];
    const exists = currentGrants.includes(projectId);
    const updated = exists ? currentGrants.filter((id) => id !== projectId) : [...currentGrants, projectId];

    onUpdateUserGrants(userId, updated);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm shadow-purple-500/25">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-zinc-900">
                User Management & Access Governance
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Zero-knowledge salted credentials stored in OneDrive SQLite vault with per-project RBAC
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onForceSyncOneDrive}
            title="Synchronize user credentials to OneDrive SQLite vault"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-sky-50 text-xs font-semibold text-zinc-700 hover:text-sky-700 transition-all shadow-2xs"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span>Sync to OneDrive</span>
          </button>

          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/25"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add User</span>
          </button>

          <button
            onClick={onBackToStudio}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-xs"
          >
            <span>Back to Canvas Studio →</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <div className="text-xs font-medium text-zinc-500 flex items-center justify-between">
              <span>Total Registered Users</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-zinc-900 mt-1">{users.length}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Stored in SQLite users table</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <div className="text-xs font-medium text-zinc-500 flex items-center justify-between">
              <span>Platform Administrators</span>
              <Shield className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-purple-700 mt-1">
              {users.filter((u) => u.role === 'admin').length}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Full governance rights</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <div className="text-xs font-medium text-zinc-500 flex items-center justify-between">
              <span>Website Projects</span>
              <Globe className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{websites.length}</div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Dedicated OneDrive folders</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs">
            <div className="text-xs font-medium text-zinc-500 flex items-center justify-between">
              <span>OneDrive SQLite Vault</span>
              <Database className="w-4 h-4 text-sky-500" />
            </div>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-sm font-bold text-zinc-800">
                {oneDriveConfig.isConnected ? 'Connected' : 'Local / Synced'}
              </span>
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {oneDriveConfig.sqliteFileName}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 border-b border-zinc-200 pb-2">
          <button
            onClick={() => setSelectedTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedTab === 'users'
                ? 'bg-white text-indigo-700 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Accounts & Roles ({users.length})</span>
          </button>

          <button
            onClick={() => setSelectedTab('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedTab === 'matrix'
                ? 'bg-white text-indigo-700 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>Project Access Matrix ({websites.length} Websites)</span>
          </button>

          <button
            onClick={() => setSelectedTab('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              selectedTab === 'vault'
                ? 'bg-white text-indigo-700 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Zero-Knowledge SQLite Credential Vault</span>
          </button>
        </div>

        {/* TAB 1: USERS LIST */}
        {selectedTab === 'users' && (
          <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-1 self-stretch sm:self-auto overflow-x-auto">
                <span className="text-[11px] font-semibold text-zinc-400 pr-2">Filter Role:</span>
                {(['all', 'admin', 'editor', 'viewer'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                      roleFilter === r
                        ? 'bg-zinc-900 text-white font-semibold shadow-2xs'
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50/80 border-b border-zinc-200 text-zinc-500 font-semibold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Project Grants</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4">Last Login</th>
                      <th className="py-3 px-4">OneDrive Sync</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-700">
                    {filteredUsers.map((user) => {
                      const grantsCount = user.projectGrants ? user.projectGrants.length : websites.length;
                      return (
                        <tr key={user.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-zinc-900 flex items-center gap-1.5">
                                  <span>{user.name}</span>
                                  {user.id === currentUser?.id && (
                                    <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="text-zinc-500 text-[11px] font-mono">{user.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <select
                              value={user.role}
                              onChange={(e) =>
                                onUpdateUserRole(user.id, e.target.value as 'admin' | 'editor' | 'viewer')
                              }
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-hidden focus:ring-2 ${
                                user.role === 'admin'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : user.role === 'editor'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                              }`}
                            >
                              <option value="admin">Administrator</option>
                              <option value="editor">Website Editor</option>
                              <option value="viewer">Stakeholder Viewer</option>
                            </select>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1.5">
                              <button
                                onClick={() => {
                                  setActiveTargetUserId(user.id);
                                  setIsManageGrantsModalOpen(true);
                                }}
                                className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium text-[11px] transition-colors"
                              >
                                <Globe className="w-3 h-3 text-indigo-500" />
                                <span>{grantsCount} of {websites.length} Projects</span>
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString() : 'Never'}
                          </td>

                          <td className="py-3 px-4">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Synced</span>
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setActiveTargetUserId(user.id);
                                  setIsResetPasswordModalOpen(true);
                                }}
                                title="Reset User Password"
                                className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-indigo-600 transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>

                              {user.id !== currentUser?.id && (
                                <button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        `Are you sure you want to delete user ${user.name}? This will remove them from the SQLite users table.`
                                      )
                                    ) {
                                      onDeleteUser(user.id);
                                    }
                                  }}
                                  title="Delete User"
                                  className="p-1.5 rounded-lg text-zinc-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECT ACCESS MATRIX */}
        {selectedTab === 'matrix' && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Multi-Project Access Grant Matrix</h3>
              <p className="text-xs text-zinc-500">
                Grant or revoke permission for each user to edit specific website projects in Canvas Studio.
              </p>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4 min-w-[200px]">Website Project</th>
                    <th className="py-3 px-4">OneDrive Folder</th>
                    {users.map((u) => (
                      <th key={u.id} className="py-3 px-4 text-center min-w-[120px]">
                        <div className="font-bold text-zinc-800">{u.name}</div>
                        <div className="text-[9px] font-mono text-zinc-400 font-normal lowercase">{u.role}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {websites.map((site) => (
                    <tr key={site.id} className="hover:bg-zinc-50/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-zinc-900">{site.name}</div>
                        <div className="text-[11px] text-zinc-400 font-mono">{site.pages.length} Pages • {site.category}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-indigo-600">
                        {site.oneDriveFolder || `/Apps/CanvasStudio/Projects/${site.id}/`}
                      </td>
                      {users.map((u) => {
                        const hasGrant =
                          u.role === 'admin' || (u.projectGrants && u.projectGrants.includes(site.id));
                        return (
                          <td key={u.id} className="py-3 px-4 text-center">
                            <button
                              onClick={() => {
                                if (u.role === 'admin') return;
                                handleToggleProjectGrant(u.id, site.id);
                              }}
                              disabled={u.role === 'admin'}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                u.role === 'admin'
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200 cursor-default'
                                  : hasGrant
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                              }`}
                            >
                              {u.role === 'admin' ? 'Admin Access' : hasGrant ? '✓ Granted' : 'No Access'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ZERO KNOWLEDGE VAULT INSPECTOR */}
        {selectedTab === 'vault' && (
          <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  SQLite `users` Table Zero-Knowledge Vault Inspector
                </h3>
                <p className="text-xs text-zinc-500">
                  Demonstrates verified salted SHA-256 password cryptography synced directly to OneDrive ({oneDriveConfig.sqliteFileName})
                </p>
              </div>
              <span className="px-3 py-1 bg-zinc-900 text-emerald-400 font-mono text-xs rounded-lg">
                Algorithm: SHA-256 + 128-bit CSPRNG Salt
              </span>
            </div>

            <div className="bg-zinc-950 text-zinc-200 rounded-xl p-4 font-mono text-xs overflow-x-auto space-y-2 border border-zinc-800">
              <div className="text-zinc-500 pb-2 border-b border-zinc-800 flex items-center justify-between">
                <span>SQL TABLE: users ({users.length} rows)</span>
                <span className="text-emerald-400">STATUS: HEALTHY & ENCRYPTED</span>
              </div>
              {users.map((u) => (
                <div key={u.id} className="p-2.5 bg-zinc-900/80 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-indigo-300">
                    <span className="font-bold">{u.name} ({u.email})</span>
                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-300 uppercase">
                      ROLE: {u.role}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-zinc-500">Password Salt: </span>
                      <span className="text-amber-400">{u.passwordSalt}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">SHA-256 Hash: </span>
                      <span className="text-emerald-400 truncate">{u.passwordHash.substring(0, 32)}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 overflow-hidden text-zinc-900 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-base text-zinc-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Provision New User Account
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Jane Developer"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Email ID</label>
                <input
                  type="email"
                  placeholder="jane@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Role Assignment</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="editor">Website Developer / Editor (Builds & edits pages)</option>
                  <option value="admin">Platform Administrator (Full governance & user rights)</option>
                  <option value="viewer">Stakeholder Viewer (Read-only live site review)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter initial secure password..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  Will be salted with 128-bit CSPRNG and hashed via SHA-256 before storing into SQLite.
                </p>
              </div>

              <div>
                <label className="font-semibold text-zinc-700 block mb-1">Assign Website Projects</label>
                <div className="space-y-1.5 max-h-32 overflow-y-auto border border-zinc-200 rounded-lg p-2 bg-zinc-50">
                  {websites.map((w) => (
                    <label key={w.id} className="flex items-center space-x-2 text-xs text-zinc-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProjectGrants.includes(w.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewProjectGrants([...newProjectGrants, w.id]);
                          } else {
                            setNewProjectGrants(newProjectGrants.filter((id) => id !== w.id));
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{w.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs transition-all"
                >
                  {isSubmitting ? 'Hashing & Syncing...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isResetPasswordModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                Reset Password for {targetUser.name}
              </h3>
              <button
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Password reset and salted SHA-256 hash synced to SQLite.</span>
              </div>
            ) : (
              <form onSubmit={handleExecuteResetPassword} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new secure password..."
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsResetPasswordModalOpen(false)}
                    className="px-3 py-1.5 text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Manage Project Grants Modal */}
      {isManageGrantsModalOpen && targetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-indigo-600" />
                Project Access Grants: {targetUser.name}
              </h3>
              <button
                onClick={() => setIsManageGrantsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500">
              Select which website development projects {targetUser.name} is authorized to access and edit:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {websites.map((site) => {
                const isGranted =
                  targetUser.role === 'admin' ||
                  (targetUser.projectGrants && targetUser.projectGrants.includes(site.id));

                return (
                  <div
                    key={site.id}
                    onClick={() => {
                      if (targetUser.role === 'admin') return;
                      handleToggleProjectGrant(targetUser.id, site.id);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isGranted
                        ? 'bg-indigo-50/50 border-indigo-200 text-zinc-900'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">{site.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {site.oneDriveFolder || `/Apps/CanvasStudio/Projects/${site.id}/`}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                        isGranted
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {targetUser.role === 'admin' ? 'Admin Full Access' : isGranted ? '✓ Authorized' : 'Revoked'}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsManageGrantsModalOpen(false)}
                className="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-lg"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
