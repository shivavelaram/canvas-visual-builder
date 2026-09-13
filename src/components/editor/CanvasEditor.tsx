import React, { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronRight,
  Plus,
  Lock,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import {
  CanvasNode,
  ComponentDef,
  DataModel,
  Transform,
  Environment,
} from '../../types/canvas';
import { ComponentNodeRenderer } from './ComponentNodeRenderer';

interface CanvasEditorProps {
  nodes: CanvasNode[];
  componentRegistry: Record<string, ComponentDef>;
  dataModels: Record<string, DataModel>;
  transforms: Record<string, Transform>;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, direction: 'up' | 'down') => void;
  resolvedPropsMap: Record<string, Record<string, any>>;
  activeEnv: Environment;
  onOpenAI: () => void;
  onQuickInsert: () => void;
}

export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  nodes,
  componentRegistry,
  selectedNodeId,
  onSelectNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveNode,
  resolvedPropsMap,
  activeEnv,
  onOpenAI,
  onQuickInsert,
}) => {
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [zoom, setZoom] = useState<number>(100);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return 'max-w-[420px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'max-w-[1240px]';
    }
  };

  // Find selected node breadcrumb
  let selectedNodeBreadcrumb: string[] = ['Apex Cloud Website'];
  if (selectedNodeId) {
    const directMatch = nodes.find((n) => n.id === selectedNodeId);
    if (directMatch) {
      selectedNodeBreadcrumb.push(directMatch.name || directMatch.componentId);
    } else {
      for (const n of nodes) {
        if (n.children) {
          const child = n.children.find((c) => c.id === selectedNodeId);
          if (child) {
            selectedNodeBreadcrumb.push(n.name || n.componentId);
            selectedNodeBreadcrumb.push(child.name || child.componentId);
            break;
          }
        }
      }
    }
  }

  return (
    <div
      className="flex-1 flex flex-col h-full bg-zinc-100/90 overflow-hidden relative"
      onClick={() => onSelectNode(null)}
    >
      {/* Top Canvas Bar */}
      <div className="h-11 bg-white border-b border-zinc-200/80 px-4 flex items-center justify-between text-xs text-zinc-600 select-none shadow-xs">
        {/* Breadcrumb / Active Section Indicator */}
        <div className="flex items-center space-x-1.5 font-medium text-xs text-zinc-500">
          <Layers className="w-3.5 h-3.5 text-indigo-600 mr-0.5" />
          {selectedNodeBreadcrumb.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-zinc-400" />}
              <span className={idx === selectedNodeBreadcrumb.length - 1 ? 'text-zinc-900 font-semibold' : ''}>
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>

        {/* Viewport Toggles & Controls */}
        <div className="flex items-center space-x-3">
          {/* Viewport Switcher */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewport('desktop');
              }}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'desktop' ? 'bg-white text-indigo-600 shadow-xs font-medium' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Desktop View (1240px)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewport('tablet');
              }}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'tablet' ? 'bg-white text-indigo-600 shadow-xs font-medium' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewport('mobile');
              }}
              className={`p-1.5 rounded-md transition-colors ${
                viewport === 'mobile' ? 'bg-white text-indigo-600 shadow-xs font-medium' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Mobile View (420px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 text-zinc-500 bg-zinc-100 px-2 py-1 rounded-lg border border-zinc-200 text-xs">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.max(50, z - 10));
              }}
              className="p-0.5 hover:text-zinc-900 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] w-9 text-center font-medium text-zinc-700">{zoom}%</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setZoom((z) => Math.min(150, z + 10));
              }}
              className="p-0.5 hover:text-zinc-900 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Copilot Quick Action */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAI();
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>AI Copy & Layout</span>
          </button>
        </div>
      </div>

      {/* Canvas Viewport Surface */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex justify-center bg-zinc-100/70">
        <div
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className={`w-full ${getViewportWidth()} transition-all duration-200`}
        >
          {/* Mock Browser Frame */}
          <div className="bg-white rounded-2xl shadow-xl border border-zinc-200/90 overflow-hidden flex flex-col min-h-[720px] transition-all">
            {/* Top Frame bar */}
            <div className="h-9 bg-zinc-100 border-b border-zinc-200 px-3.5 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              {/* URL Address Bar */}
              <div className="px-4 py-1 rounded-md bg-white text-[11px] font-medium text-zinc-600 border border-zinc-200/80 flex items-center space-x-1.5 shadow-xs w-72 sm:w-96 justify-center">
                <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">https://www.apexcloud.io</span>
              </div>

              <div className="flex items-center space-x-1 text-zinc-400">
                <RotateCw className="w-3 h-3" />
              </div>
            </div>

            {/* Seamless Website Canvas Content */}
            <div className="flex-1 bg-white flex flex-col">
              {nodes.map((node) => (
                <ComponentNodeRenderer
                  key={node.id}
                  node={node}
                  compDef={componentRegistry[node.componentId]}
                  isSelected={selectedNodeId === node.id}
                  onSelect={onSelectNode}
                  onDelete={onDeleteNode}
                  onDuplicate={onDuplicateNode}
                  onMove={onMoveNode}
                  resolvedProps={resolvedPropsMap[node.id] || node.props}
                  isEditableMode={true}
                />
              ))}

              {/* Add Section Dropzone */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickInsert();
                }}
                className="m-6 border-2 border-dashed border-zinc-200 hover:border-indigo-400 hover:bg-indigo-50/20 rounded-2xl p-6 text-center transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center justify-center space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-zinc-300 group-hover:border-indigo-400 flex items-center justify-center text-zinc-500 group-hover:text-indigo-600 transition-colors shadow-xs">
                    <Plus className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-700 group-hover:text-indigo-600">
                    Add Another SaaS Section
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Insert Navbar, Hero, Feature Grid, Showcase, Pricing, Testimonial, or Footer
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
