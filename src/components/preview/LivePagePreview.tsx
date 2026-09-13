import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Globe,
  ArrowLeft,
  Share2,
  CheckCircle2,
  Lock,
  ExternalLink,
  Menu as MenuIcon,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { CanvasNode, ComponentDef, Website, NavigationMenuItem } from '../../types/canvas';
import { ComponentNodeRenderer } from '../editor/ComponentNodeRenderer';

interface LivePagePreviewProps {
  nodes: CanvasNode[];
  componentRegistry: Record<string, ComponentDef>;
  resolvedPropsMap: Record<string, Record<string, any>>;
  isPublishedView?: boolean;
  versionNumber: string;
  website?: Website;
  activePageId?: string;
  onNavigateToPage?: (pageId: string) => void;
  onBackToEditor: () => void;
  onRefreshData: () => void;
}

export const LivePagePreview: React.FC<LivePagePreviewProps> = ({
  nodes,
  componentRegistry,
  resolvedPropsMap,
  isPublishedView = false,
  versionNumber,
  website,
  activePageId,
  onNavigateToPage,
  onBackToEditor,
  onRefreshData,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const activePage = website?.pages.find((p) => p.id === activePageId) || website?.pages[0];

  // Resolve menu items: custom menuItems or derived from pages
  const menuItems: NavigationMenuItem[] =
    website?.menuItems && website.menuItems.length > 0
      ? website.menuItems.filter((it) => it.isVisible)
      : (website?.pages || []).map((p, idx) => ({
          id: `menu-${p.id}`,
          label: p.title,
          pageId: p.id,
          slug: p.slug,
          order: idx + 1,
          isVisible: true,
        }));

  const getWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[420px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'max-w-[1240px]';
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onRefreshData();
      setIsRefreshing(false);
    }, 400);
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const currentPath = activePage?.slug === 'home' ? '' : activePage?.slug || '';
  const currentUrl = website?.domain
    ? `${website.domain.replace(/\/$/, '')}/${currentPath}`
    : `https://www.apexcloud.io/${currentPath}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-100/90 text-zinc-900 overflow-hidden">
      {/* Top Preview Bar */}
      <div className="h-12 bg-white border-b border-zinc-200 px-6 flex items-center justify-between text-xs select-none shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToEditor}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-medium transition-colors border border-zinc-200/80"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Builder</span>
          </button>

          <div className="h-4 w-px bg-zinc-200" />

          <div className="flex items-center space-x-2">
            <Globe className={`w-3.5 h-3.5 ${isPublishedView ? 'text-emerald-600' : 'text-indigo-600'}`} />
            <span className="font-semibold text-zinc-800">
              {website ? `${website.name} • ${activePage?.title || 'Home'}` : isPublishedView ? 'Published Production Website' : 'Staged Live Preview'}
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
              {versionNumber}
            </span>
          </div>
        </div>

        {/* Viewport & Actions */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'desktop' ? 'bg-white text-indigo-600 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'tablet' ? 'bg-white text-indigo-600 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'mobile' ? 'bg-white text-indigo-600 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg font-medium transition-colors border border-zinc-200/80"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Signed URL Copied!' : 'Share Public Link'}</span>
          </button>
        </div>
      </div>

      {/* Render Surface */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex justify-center bg-zinc-100/70">
        <div className={`w-full ${getWidth()} bg-white rounded-2xl shadow-xl border border-zinc-200/90 overflow-hidden transition-all duration-200 min-h-[720px] flex flex-col`}>
          {/* Top Simulated Browser Navigation Bar */}
          <div className="h-10 bg-zinc-100 border-b border-zinc-200 px-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="px-4 py-1 rounded-md bg-white text-[11px] font-medium text-zinc-600 border border-zinc-200/80 flex items-center space-x-1.5 shadow-xs w-72 sm:w-96 justify-center">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate font-mono">{currentUrl}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Live Edge
              </span>
            </div>
          </div>

          {/* Interactive Linked Multi-Page Navigation Bar */}
          {website && menuItems.length > 0 && (
            <div className="bg-zinc-950 text-white px-5 py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs">
              <div className="font-bold text-sm tracking-tight flex items-center gap-1.5 text-white">
                <span className="text-indigo-400">⚡</span>
                <span>{website.name}</span>
              </div>

              {/* Linked Page Navigation Links */}
              <div className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto">
                {menuItems.map((item) => {
                  const isActive = item.pageId === activePageId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.pageId && onNavigateToPage) {
                          onNavigateToPage(item.pageId);
                        } else if (item.externalUrl) {
                          window.open(item.externalUrl, '_blank');
                        }
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
                      }`}
                    >
                      <span>{item.label}</span>
                      {item.externalUrl && <ExternalLink className="w-2.5 h-2.5 text-zinc-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-[11px] text-zinc-400 font-mono">
                  {activePage?.title} (/{activePage?.slug})
                </span>
              </div>
            </div>
          )}

          {/* Seamless Website Page Content Flow */}
          <div className="flex-1 bg-white flex flex-col">
            {nodes.map((node) => (
              <ComponentNodeRenderer
                key={node.id}
                node={node}
                compDef={componentRegistry[node.componentId]}
                resolvedProps={resolvedPropsMap[node.id] || node.props}
                isEditableMode={false}
              />
            ))}

            {nodes.length === 0 && (
              <div className="text-center py-24 text-zinc-400 text-sm">
                No sections added to this website page.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
