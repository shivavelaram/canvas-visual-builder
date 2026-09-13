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
} from 'lucide-react';
import { Tenant, Workspace, Environment, UserRole } from '../../types/canvas';

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
}) => {
  return (
    <header className="bg-white border-b border-zinc-200 text-zinc-900 select-none sticky top-0 z-40 shadow-xs">
      {/* Primary Studio Header */}
      <div className="flex items-center justify-between px-5 h-14">
        {/* Left: Brand & Website Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 pr-4 border-r border-zinc-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-white shadow-sm shadow-indigo-500/25">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-zinc-900">Apex Cloud</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  SaaS Website
                </span>
              </div>
            </div>
          </div>

          {/* Primary View Mode Switcher */}
          <nav className="flex items-center space-x-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200/80">
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
              <span>Releases & Deploy</span>
            </button>
          </nav>
        </div>

        {/* Center / Domain Indicator */}
        <div className="hidden lg:flex items-center space-x-2 text-xs text-zinc-500 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-zinc-700">apexcloud.io</span>
          <span className="text-zinc-400">|</span>
          <span className="text-[11px] font-mono text-zinc-500">Fast Global Edge</span>
        </div>

        {/* Right side: AI Copilot, Environment Badge & Publish Action */}
        <div className="flex items-center space-x-3">
          {/* AI Copilot */}
          <button
            onClick={onOpenAIModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200" />
            <span>AI Copilot</span>
          </button>

          {/* Quick Preview Toggle if currently in draft */}
          {canvasMode === 'draft' ? (
            <button
              onClick={() => onSelectCanvasMode('preview')}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span>Full Website Preview</span>
            </button>
          ) : (
            <button
              onClick={() => onSelectCanvasMode('draft')}
              className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-semibold transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Edit Sections</span>
            </button>
          )}

          {/* Publish Button */}
          <button
            onClick={onPublishClick}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98] ${
              hasUnpublishedChanges
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{hasUnpublishedChanges ? 'Publish Website' : 'Published'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-white/20">
              {publishedVersionNumber}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
