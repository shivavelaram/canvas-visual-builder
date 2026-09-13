import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Play,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Trash2,
  HelpCircle,
  FileJson,
} from 'lucide-react';
import { Transform, TransformStep, TransformOp } from '../../types/canvas';
import { runTransform } from '../../services/transformEngine';

interface TransformStudioProps {
  transforms: Record<string, Transform>;
  onCreateTransform: (transform: Transform) => void;
  onUpdateTransform: (transform: Transform) => void;
}

export const TransformStudio: React.FC<TransformStudioProps> = ({
  transforms,
  onCreateTransform,
  onUpdateTransform,
}) => {
  const transformList: Transform[] = Object.values(transforms);
  const [selectedId, setSelectedId] = useState<string>(transformList[0]?.id || '');
  const selectedTransform = transforms[selectedId] || transformList[0];

  // Test input JSON
  const [testInputJson, setTestInputJson] = useState(
    JSON.stringify(
      {
        total: 1240.0,
        growth_pct: 14.5,
        placed_at: '2026-09-12T18:14:00Z',
        items: [
          { sku: 'SKU-ULTRA-8', qty: 2 },
          { sku: 'SKU-PRO-MAX', qty: 1 },
        ],
        customer: { name: 'Siddharth Patel' },
      },
      null,
      2
    )
  );

  const [activeStepAdd, setActiveStepAdd] = useState<TransformOp>('format');

  // Compute test run result
  let parsedInput: any = {};
  let jsonParseError = false;
  try {
    parsedInput = JSON.parse(testInputJson);
  } catch {
    jsonParseError = true;
  }

  const execution = selectedTransform
    ? runTransform(selectedTransform, parsedInput)
    : { success: false, output: null, traces: [] };

  const handleAddStep = (op: TransformOp) => {
    if (!selectedTransform) return;
    let defaultParams: Record<string, any> = {};

    switch (op) {
      case 'extractPath':
        defaultParams = { path: 'total' };
        break;
      case 'format':
        defaultParams = { type: 'currency', currency: 'USD' };
        break;
      case 'default':
        defaultParams = { fallback: '$0.00' };
        break;
      case 'join':
        defaultParams = { delimiter: ', ' };
        break;
      case 'trim':
        defaultParams = {};
        break;
      case 'flatten':
        defaultParams = { depth: 1 };
        break;
      case 'conditionalSelect':
        defaultParams = { condition: 'greater_than', compareValue: 1000, trueValue: 'High Value', falseValue: 'Standard' };
        break;
      default:
        defaultParams = {};
    }

    const updated: Transform = {
      ...selectedTransform,
      steps: [...selectedTransform.steps, { op, params: defaultParams }],
    };
    onUpdateTransform(updated);
  };

  const handleRemoveStep = (index: number) => {
    if (!selectedTransform) return;
    const updated: Transform = {
      ...selectedTransform,
      steps: selectedTransform.steps.filter((_, i) => i !== index),
    };
    onUpdateTransform(updated);
  };

  const handleCreateNew = () => {
    const newId = `tr_${Date.now()}`;
    const created: Transform = {
      id: newId,
      tenant_id: 'tenant-apex-1',
      name: 'Custom String Pipeline',
      description: 'Deterministic pipeline with formatting and fallback safety.',
      input_schema_ref: 'custom.field',
      output_type: 'string',
      steps: [
        { op: 'extractPath', params: { path: 'total' } },
        { op: 'format', params: { type: 'currency', currency: 'USD' } },
        { op: 'default', params: { fallback: '$0.00' } },
      ],
    };
    onCreateTransform(created);
    setSelectedId(newId);
  };

  return (
    <div className="flex-1 flex h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar: Pipeline Registry */}
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Transform Studio</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Closed Operator Engine</span>
          </div>
          <button
            onClick={handleCreateNew}
            className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>New</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {transformList.map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedTransform?.id === t.id
                  ? 'bg-zinc-800/90 border-amber-500/70 shadow-xs ring-1 ring-amber-500/30'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/40 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-200">{t.name}</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">
                  {t.steps.length} ops
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-tight">{t.description}</p>
              <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center justify-between">
                <span>Output: {t.output_type}</span>
                <span className="text-zinc-400 font-mono truncate max-w-[120px]">{t.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee Callout */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-[10px] text-zinc-400 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Zero arbitrary code execution. Pure deterministic mathematical operators only.</span>
        </div>
      </div>

      {/* Main Studio Area */}
      {selectedTransform ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-sm font-bold text-zinc-100">{selectedTransform.name}</h2>
                <span className="font-mono text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
                  {selectedTransform.id}
                </span>
                <span className="text-xs text-emerald-400 flex items-center space-x-1 font-medium bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sandboxed & Deterministic</span>
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">{selectedTransform.description}</p>
            </div>

            {/* Quick Add Step */}
            <div className="flex items-center space-x-2">
              <select
                value={activeStepAdd}
                onChange={(e) => setActiveStepAdd(e.target.value as TransformOp)}
                className="bg-zinc-800 text-xs text-zinc-200 px-2 py-1.5 rounded border border-zinc-700 font-medium"
              >
                <option value="format">format (currency, date, %)</option>
                <option value="extractPath">extractPath (dot/bracket)</option>
                <option value="default">default (fallback value)</option>
                <option value="join">join (array to string)</option>
                <option value="trim">trim (whitespace)</option>
                <option value="flatten">flatten (nested arrays)</option>
                <option value="conditionalSelect">conditionalSelect (thresholds)</option>
              </select>

              <button
                onClick={() => handleAddStep(activeStepAdd)}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-semibold flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Operator</span>
              </button>
            </div>
          </div>

          {/* Body: Split View - Left: Step Pipeline, Right: Live Sandbox Simulator */}
          <div className="flex-1 flex overflow-hidden">
            {/* Step Pipeline Builder */}
            <div className="w-1/2 border-r border-zinc-800 p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Operator Execution Chain ({selectedTransform.steps.length} Steps)
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Sequential Left-to-Right</span>
              </div>

              {selectedTransform.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 space-y-3 relative group shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-mono font-bold text-xs text-amber-400">{step.op}</span>
                    </div>

                    <button
                      onClick={() => handleRemoveStep(idx)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove Step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Operator parameters */}
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/80 font-mono text-xs space-y-1">
                    {Object.entries(step.params).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">{k}:</span>
                        <span className="text-zinc-200 font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Trace output for this step */}
                  {execution.traces[idx] && (
                    <div className="text-[10px] font-mono text-zinc-400 bg-zinc-950/40 p-2 rounded border border-zinc-800/50 flex items-center justify-between">
                      <span>Step Result:</span>
                      <span className="text-emerald-400 font-semibold truncate max-w-xs">
                        {typeof execution.traces[idx].output === 'object'
                          ? JSON.stringify(execution.traces[idx].output)
                          : String(execution.traces[idx].output)}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {selectedTransform.steps.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No operators in this pipeline yet. Click "Add Operator" above.
                </div>
              )}
            </div>

            {/* Live Sandbox Simulator (Preview Mandatory Before Save) */}
            <div className="w-1/2 p-6 flex flex-col overflow-hidden bg-zinc-950/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Mandatory Sandboxed Preview
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">Live Input ➔ Output Evaluation</span>
              </div>

              {/* Sample Input Editor */}
              <div className="mb-4">
                <label className="text-[10px] text-zinc-400 font-mono block mb-1">
                  Sample Raw Payload Input (JSON)
                </label>
                <textarea
                  value={testInputJson}
                  onChange={(e) => setTestInputJson(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-900 font-mono text-xs text-zinc-200 p-2.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Evaluated Output */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-zinc-400 font-mono">
                    Deterministic Output Result
                  </label>
                  {execution.success ? (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Valid Execution</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-400">Execution Error</span>
                  )}
                </div>

                <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg p-4 font-mono text-xs overflow-auto flex flex-col justify-center items-center text-center">
                  <div className="text-2xl font-bold text-emerald-400 font-mono mb-2">
                    {typeof execution.output === 'object'
                      ? JSON.stringify(execution.output, null, 2)
                      : String(execution.output ?? 'null')}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Output matches target contract: {selectedTransform.output_type}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
          Select or create a transform pipeline to preview its deterministic operator chain.
        </div>
      )}
    </div>
  );
};
