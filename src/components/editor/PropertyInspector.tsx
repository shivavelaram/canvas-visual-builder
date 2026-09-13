import React from 'react';
import {
  CanvasNode,
  ComponentDef,
  DataModel,
  Transform,
  DataBinding,
  PropDefinition,
} from '../../types/canvas';
import {
  Sliders,
  Sparkles,
  Type,
  Layers,
} from 'lucide-react';

interface PropertyInspectorProps {
  selectedNode: CanvasNode | null;
  compDef?: ComponentDef;
  dataModels: Record<string, DataModel>;
  transforms: Record<string, Transform>;
  resolvedProps: Record<string, any>;
  onUpdateProp: (nodeId: string, propKey: string, value: any) => void;
  onUpdateVariant: (nodeId: string, variant: string) => void;
  onUpdateName: (nodeId: string, name: string) => void;
  onBindProp: (nodeId: string, propKey: string, binding: DataBinding) => void;
  onUnbindProp: (nodeId: string, propKey: string) => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  selectedNode,
  compDef,
  resolvedProps,
  onUpdateProp,
  onUpdateVariant,
  onUpdateName,
}) => {
  if (!selectedNode || !compDef) {
    return (
      <div className="w-84 bg-white border-l border-zinc-200 p-8 flex flex-col items-center justify-center text-center text-zinc-400">
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-3">
          <Sliders className="w-6 h-6 stroke-[1.5]" />
        </div>
        <h4 className="text-sm font-bold text-zinc-800">Select Any Section</h4>
        <p className="text-xs mt-1.5 text-zinc-500 max-w-xs leading-relaxed">
          Click any section in the website canvas to customize its headlines, call-to-actions, pricing, or styling.
        </p>
      </div>
    );
  }

  const propSchemas: Record<string, PropDefinition> = compDef.prop_schema || {};

  return (
    <div className="w-84 bg-white border-l border-zinc-200 flex flex-col h-full text-zinc-900 shadow-xs">
      {/* Inspector Header */}
      <div className="p-4 border-b border-zinc-200 bg-zinc-50/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-zinc-900">{compDef.name}</span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
            Section Config
          </span>
        </div>

        {/* Section Label */}
        <div className="mt-3">
          <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
            Section Label
          </label>
          <input
            type="text"
            value={selectedNode.name || ''}
            onChange={(e) => onUpdateName(selectedNode.id, e.target.value)}
            placeholder={compDef.name}
            className="w-full bg-white text-xs px-3 py-1.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium text-zinc-800 shadow-xs"
          />
        </div>

        {/* Variant selector if available */}
        {compDef.variants && compDef.variants.length > 1 && (
          <div className="mt-3">
            <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
              Layout Style
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {compDef.variants.map((v) => (
                <button
                  key={v}
                  onClick={() => onUpdateVariant(selectedNode.id, v)}
                  className={`py-1 px-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                    selectedNode.variant === v
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  {v.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Props Fields List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center space-x-1 text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
          <Type className="w-3.5 h-3.5 text-indigo-600" />
          <span>Content & Messaging</span>
        </div>

        {Object.entries(propSchemas).map(([propKey, def]) => {
          const val = resolvedProps[propKey] !== undefined ? resolvedProps[propKey] : selectedNode.props[propKey] ?? '';

          return (
            <div key={propKey} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-700 capitalize">
                  {propKey.replace(/([A-Z])/g, ' $1')}
                </label>
                <span className="text-[10px] font-mono text-zinc-400">
                  {def.type}
                </span>
              </div>

              {/* Textarea for long text */}
              {def.type === 'string' && (propKey.includes('headline') || propKey.includes('subheadline') || propKey.includes('quote') || propKey.includes('description') || propKey.includes('notes')) ? (
                <textarea
                  rows={3}
                  value={val}
                  onChange={(e) => onUpdateProp(selectedNode.id, propKey, e.target.value)}
                  className="w-full bg-white text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-800 leading-relaxed shadow-xs"
                />
              ) : def.type === 'string' ? (
                <input
                  type="text"
                  value={val}
                  onChange={(e) => onUpdateProp(selectedNode.id, propKey, e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-800 shadow-xs"
                />
              ) : def.type === 'array' ? (
                <input
                  type="text"
                  value={Array.isArray(val) ? val.join(', ') : val}
                  onChange={(e) =>
                    onUpdateProp(
                      selectedNode.id,
                      propKey,
                      e.target.value.split(',').map((s) => s.trim())
                    )
                  }
                  placeholder="Comma separated items"
                  className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-800 shadow-xs"
                />
              ) : (
                <input
                  type="text"
                  value={String(val)}
                  onChange={(e) => onUpdateProp(selectedNode.id, propKey, e.target.value)}
                  className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-800 shadow-xs"
                />
              )}

              {def.description && (
                <p className="text-[10px] text-zinc-400">{def.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Quick Action */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs">
        <span className="text-zinc-500">Live updating</span>
        <span className="text-emerald-600 font-semibold flex items-center gap-1">
          ✓ Sync active
        </span>
      </div>
    </div>
  );
};
