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
} from 'lucide-react';
import { CanvasNode, ComponentDef } from '../../types/canvas';
import { ComponentNodeRenderer } from '../editor/ComponentNodeRenderer';

interface LivePagePreviewProps {
  nodes: CanvasNode[];
  componentRegistry: Record<string, ComponentDef>;
  resolvedPropsMap: Record<string, Record<string, any>>;
  isPublishedView?: boolean;
  versionNumber: string;
  onBackToEditor: () => void;
  onRefreshData: () => void;
}

export const LivePagePreview: React.FC<LivePagePreviewProps> = ({
  nodes,
  componentRegistry,
  resolvedPropsMap,
  isPublishedView = false,
  versionNumber,
  onBackToEditor,
  onRefreshData,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

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
              {isPublishedView ? 'Published Production Website' : 'Staged Live Preview'}
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
          {/* Top Browser Bar */}
          <div className="h-9 bg-zinc-100 border-b border-zinc-200 px-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>

            <div className="px-4 py-1 rounded-md bg-white text-[11px] font-medium text-zinc-600 border border-zinc-200/80 flex items-center space-x-1.5 shadow-xs w-72 sm:w-96 justify-center">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">https://www.apexcloud.io</span>
            </div>

            <div className="w-10 flex justify-end">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Live Edge
              </span>
            </div>
          </div>

          {/* Seamless SaaS Website Flow */}
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
                No sections added to this website.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
