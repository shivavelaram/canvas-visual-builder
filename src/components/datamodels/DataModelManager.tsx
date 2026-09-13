import React, { useState } from 'react';
import {
  Database,
  Lock,
  Plus,
  Sparkles,
  CheckCircle2,
  Table,
  FileJson,
  Cable,
  ArrowRight,
  Shield,
  Layers,
  Code,
} from 'lucide-react';
import { DataModel, DataModelField, Connector } from '../../types/canvas';

interface DataModelManagerProps {
  dataModels: Record<string, DataModel>;
  connectors: Connector[];
  onCreateModel: (model: DataModel) => void;
  onUpdateModel: (model: DataModel) => void;
}

export const DataModelManager: React.FC<DataModelManagerProps> = ({
  dataModels,
  connectors,
  onCreateModel,
  onUpdateModel,
}) => {
  const modelList: DataModel[] = Object.values(dataModels);
  const [selectedModelId, setSelectedModelId] = useState<string>(modelList[0]?.id || '');
  const [showInferenceModal, setShowInferenceModal] = useState(false);
  const [sampleJsonInput, setSampleJsonInput] = useState(
    JSON.stringify(
      {
        orderId: 'ORD-7711',
        customer: {
          name: 'Nadia Chen',
          email: 'nadia@chenventures.com',
          vip: true,
        },
        items: [
          { sku: 'SKU-QUANTUM-X', qty: 3, unitPrice: 310.0 },
          { sku: 'SKU-STAND-PRO', qty: 1, unitPrice: 95.0 },
        ],
        subtotal: 1025.0,
        tax: 82.0,
        grandTotal: 1107.0,
        currency: 'USD',
        status: 'PAID',
        createdAt: '2026-09-12T19:45:00Z',
      },
      null,
      2
    )
  );

  const selectedModel = dataModels[selectedModelId] || modelList[0];

  const inferSchemaFromJson = () => {
    try {
      const parsed = JSON.parse(sampleJsonInput);
      const inferredFields: DataModelField[] = [];

      const walk = (obj: any, prefix = '') => {
        for (const [k, v] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${k}` : k;
          if (Array.isArray(v)) {
            inferredFields.push({
              path: `${path}[]`,
              type: 'array',
              required: true,
              sampleValue: v,
            });
            if (v.length > 0 && typeof v[0] === 'object') {
              for (const [subK, subV] of Object.entries(v[0])) {
                inferredFields.push({
                  path: `${path}[].${subK}`,
                  type: typeof subV === 'number' ? 'number' : typeof subV === 'boolean' ? 'boolean' : 'string',
                  format: subK.toLowerCase().includes('price') || subK.toLowerCase().includes('total') ? 'currency' : 'none',
                  sampleValue: subV,
                });
              }
            }
          } else if (typeof v === 'object' && v !== null) {
            walk(v, path);
          } else {
            const isNum = typeof v === 'number';
            const isBool = typeof v === 'boolean';
            const isCurrency = k.toLowerCase().includes('total') || k.toLowerCase().includes('tax') || k.toLowerCase().includes('price');
            const isDate = k.toLowerCase().includes('at') || k.toLowerCase().includes('date');
            const isEmail = k.toLowerCase().includes('email');

            inferredFields.push({
              path,
              type: isNum ? 'number' : isBool ? 'boolean' : 'string',
              format: isCurrency ? 'currency' : isDate ? 'date' : isEmail ? 'email' : 'none',
              sampleValue: v,
            });
          }
        }
      };

      walk(parsed);

      const newModel: DataModel = {
        id: `inferred_model_${Date.now()}`,
        tenant_id: 'tenant-apex-1',
        name: 'Inferred Customer Order Stream',
        version_number: 1,
        source_type: 'json',
        connector_id: connectors[0]?.id || 'conn-pg-1',
        fields: inferredFields,
        immutable_after_publish: false,
        created_at: new Date().toISOString(),
      };

      onCreateModel(newModel);
      setSelectedModelId(newModel.id);
      setShowInferenceModal(false);
    } catch {
      alert('Invalid JSON in sample input. Please verify syntax.');
    }
  };

  return (
    <div className="flex-1 flex h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar: Model Registry List */}
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Data Model Registry</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Governed Schema Contracts</span>
          </div>
          <button
            onClick={() => setShowInferenceModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>New Model</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {modelList.map((model) => (
            <div
              key={model.id}
              onClick={() => setSelectedModelId(model.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedModel?.id === model.id
                  ? 'bg-zinc-800/90 border-indigo-500/70 shadow-xs ring-1 ring-indigo-500/30'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/40 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-zinc-200">{model.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400">
                  v{model.version_number}
                </span>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-zinc-900 text-cyan-400 border border-zinc-800">
                  {model.source_type}
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">{model.fields.length} typed fields</span>
              </div>

              {model.immutable_after_publish && (
                <div className="flex items-center space-x-1 text-[10px] text-amber-400 mt-2">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Pinned by Published Release</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area: Field Tree Inspector */}
      {selectedModel ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-base font-bold text-zinc-100">{selectedModel.name}</h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  ID: {selectedModel.id}
                </span>
                <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  Source: {selectedModel.source_type}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Bound to connector: <span className="font-mono text-zinc-300">{selectedModel.connector_id}</span> •
                Created: {new Date(selectedModel.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowInferenceModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium border border-zinc-700"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Infer from Sample</span>
              </button>
            </div>
          </div>

          {/* Fields Table */}
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-xs">
              <div className="p-3 bg-zinc-950/70 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Registered Schema Fields ({selectedModel.fields.length})
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">Deterministic Field Paths</span>
              </div>

              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-950/50 uppercase text-[10px] font-semibold text-zinc-400 border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Field Path</th>
                    <th className="px-4 py-3">Data Type</th>
                    <th className="px-4 py-3">Semantic Format</th>
                    <th className="px-4 py-3">Required</th>
                    <th className="px-4 py-3">Live Sample Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                  {selectedModel.fields.map((f, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3 font-semibold text-indigo-300">{f.path}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {f.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {f.format && f.format !== 'none' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            {f.format}
                          </span>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {f.required ? (
                          <span className="text-emerald-400 font-semibold">Yes</span>
                        ) : (
                          <span className="text-zinc-500">Optional</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-400 truncate max-w-xs">
                        {typeof f.sampleValue === 'object'
                          ? JSON.stringify(f.sampleValue).substring(0, 40)
                          : String(f.sampleValue ?? '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
          Select or create a data model to view its schema contract.
        </div>
      )}

      {/* Inference Modal */}
      {showInferenceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-100">Infer Data Model from JSON / REST Sample</h3>
              </div>
              <button
                onClick={() => setShowInferenceModal(false)}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Paste a sample payload from your REST API, SQL query, or GraphQL response. The engine will derive a typed, versioned model schema.
            </p>

            <div>
              <textarea
                value={sampleJsonInput}
                onChange={(e) => setSampleJsonInput(e.target.value)}
                rows={10}
                className="w-full bg-zinc-950 font-mono text-xs text-zinc-200 p-3 rounded-lg border border-zinc-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowInferenceModal(false)}
                className="px-3.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={inferSchemaFromJson}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Generate Data Model Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
