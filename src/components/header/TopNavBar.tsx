import React from 'react';
import {
  Layers,
  Sparkles,
  GitBranch,
  Globe,
  Radio,
  Eye,
  Edit3,
  ExternalLink,
  ChevronDown,
  LayoutTemplate,
  Sliders,
  CheckCircle2,
  FolderArchive,
  Cloud,
  Zap,
  User,
  ShieldCheck,
  LogIn,
  Download,
} from 'lucide-react';
import { Tenant, Workspace, Environment, UserRole, Website, Webpage, AuthUser, OneDriveConfig } from '../../types/canvas';
import { WebsitePageManager } from '../websites/WebsitePageManager';

export type ActiveTab =
  | 'editor'
  | 'data-models'
  | 'connectors'
  | 'transforms'
  | 'ai-jobs'
  | 'releases'
  | 'audit';

export type CanvasMode = 'draft' | 'preview' | 'published';

interface TopNavBarProps {
  tenants: Tenant[];
  activeTenant: Tenant;
  onSelectTenant: (tenant: Tenant) => void;
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onSelectWorkspace: (workspace: Workspace) => void;
  activeEnv: Environment;
  onSelectEnv: (env: Environment) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  canvasMode: CanvasMode;
  onSelectCanvasMode: (mode: CanvasMode) => void;
  currentUserRole: UserRole;
  onChangeUserRole: (role: UserRole) => void;
  onOpenAIModal: () => void;
  onPublishClick: () => void;
  hasUnpublishedChanges: boolean;
  publishedVersionNumber: string;

  // New Website, Auth, Bundle, OneDrive & GraphQL props
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onOpenWebBundleModal: () => void;
  onOpenOneDriveModal: () => void;
  onOpenGraphQLModal: () => void;
  oneDriveConfig: OneDriveConfig;
  websites: Website[];
  activeWebsiteId: string;
  activePageId: string;
  onSelectWebsite: (siteId: string) => void;
  onSelectPage: (pageId: string) => void;
  onCreateWebsite: (newSite: Website) => void;
  onCreatePage: (siteId: string, newPage: Webpage) => void;
  onSaveCurrentPage: () => void;
  hasUnsavedPageChanges: boolean;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  tenants,
  activeTenant,
  onSelectTenant,
  workspaces,
  activeWorkspace,
  onSelectWorkspace,
  activeEnv,
  onSelectEnv,
  activeTab,
  onSelectTab,
  canvasMode,
  onSelectCanvasMode,
  currentUserRole,
  onChangeUserRole,
  onOpenAIModal,
  onPublishClick,
  hasUnpublishedChanges,
  publishedVersionNumber,

  currentUser,
  onOpenLoginModal,
  onOpenWebBundleModal,
  onOpenOneDriveModal,
  onOpenGraphQLModal,
  oneDriveConfig,
  websites,
  activeWebsiteId,
  activePageId,
  onSelectWebsite,
  onSelectPage,
  onCreateWebsite,
  onCreatePage,
  onSaveCurrentPage,
  hasUnsavedPageChanges,
}) => {
  return (
    <header className="bg-white border-b border-zinc-200 text-zinc-900 select-none sticky top-0 z-40 shadow-xs">
      {/* Primary Studio Header */}
      <div className="flex items-center justify-between px-4 h-14 gap-3">
        {/* Left: Brand & Multi-Website / Page Navigation */}
        <div className="flex items-center space-x-3 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-2.5 pr-3 border-r border-zinc-200 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-sm tracking-tight text-zinc-900">Canvas Studio</span>
            </div>
          </div>

          {/* Website & Webpages Switcher */}
          <WebsitePageManager
            websites={websites}
            activeWebsiteId={activeWebsiteId}
            activePageId={activePageId}
            hasUnsavedChanges={hasUnsavedPageChanges}
            onSelectWebsite={onSelectWebsite}
            onSelectPage={onSelectPage}
            onCreateWebsite={onCreateWebsite}
            onCreatePage={onCreatePage}
            onSaveCurrentPage={onSaveCurrentPage}
          />
        </div>

        {/* Center / Mode Switcher */}
        <div className="hidden xl:flex items-center space-x-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80 shrink-0">
          <button
            onClick={() => {
              onSelectTab('editor');
              onSelectCanvasMode('draft');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'editor' && canvasMode === 'draft'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Visual Builder</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('editor');
              onSelectCanvasMode('preview');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'editor' && (canvasMode === 'preview' || canvasMode === 'published')
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Website View</span>
          </button>

          <button
            onClick={() => onSelectTab('releases')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'releases'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Releases</span>
          </button>
        </div>

        {/* Right side: Export Bundle, OneDrive Sync, GraphQL Bridge, Login & Publish */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* GraphQL Bridge Trigger */}
          <button
            onClick={onOpenGraphQLModal}
            title="GraphQL API & Dynamic Query Bridge"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-violet-50 hover:border-violet-300 text-zinc-700 hover:text-violet-700 text-xs font-semibold transition-all shadow-2xs"
          >
            <Zap className="w-3.5 h-3.5 text-violet-600" />
            <span className="hidden md:inline">GraphQL Bridge</span>
          </button>

          {/* OneDrive / SQLite Sync Trigger */}
          <button
            onClick={onOpenOneDriveModal}
            title="OneDrive & SQLite Dynamic Store Connection"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-sky-50 hover:border-sky-300 text-zinc-700 hover:text-sky-700 text-xs font-semibold transition-all shadow-2xs"
          >
            <Cloud className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden md:inline">OneDrive DB</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                oneDriveConfig.isConnected ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
            />
          </button>

          {/* Download Web Bundle (.zip) */}
          <button
            onClick={onOpenWebBundleModal}
            title="Download all pages as a runnable Node.js web server bundle"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden sm:inline">Web Bundle (.zip)</span>
          </button>

          {/* User / Admin Login Button */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 text-xs font-semibold transition-all shadow-2xs"
          >
            {currentUser ? (
              <>
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="hidden lg:inline">{currentUser.name}</span>
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {currentUser.role}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Sign In</span>
              </>
            )}
          </button>

          {/* Publish Button */}
          <button
            onClick={onPublishClick}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98] ${
              hasUnpublishedChanges
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{hasUnpublishedChanges ? 'Publish' : 'Published'}</span>
            <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-white/20">
              {publishedVersionNumber}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

