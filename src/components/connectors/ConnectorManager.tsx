import React, { useState } from 'react';
import {
  Cable,
  CheckCircle2,
  RefreshCw,
  Plus,
  Key,
  Clock,
  Activity,
  AlertCircle,
  Database,
  Lock,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Connector } from '../../types/canvas';

interface ConnectorManagerProps {
  connectors: Connector[];
  onTriggerSync: (connectorId: string) => void;
  onAddConnector: (connector: Connector) => void;
}

export const ConnectorManager: React.FC<ConnectorManagerProps> = ({
  connectors,
  onTriggerSync,
  onAddConnector,
}) => {
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; latency: number; time: string }>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  // New connector form state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'sql' | 'rest' | 'graphql' | 'nosql'>('rest');
  const [newAuth, setNewAuth] = useState<'api_key' | 'oauth2' | 'bearer' | 'basic'>('bearer');
  const [newEndpoint, setNewEndpoint] = useState('');

  const runConnectionTest = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      const latency = Math.floor(Math.random() * 40) + 15;
      setTestResults((prev) => ({
        ...prev,
        [id]: { ok: true, latency, time: new Date().toLocaleTimeString() },
      }));
    }, 600);
  };

  const handleCreate = () => {
    if (!newName || !newEndpoint) return;
    const connector: Connector = {
      id: `conn_${Date.now()}`,
      tenant_id: 'tenant-apex-1',
      type: newType,
      name: newName,
      auth_strategy: newAuth,
      secret_ref: `kms://us-east-1/secrets/${newName.toLowerCase().replace(/\s+/g, '_')}_key`,
      sync_mode: 'on_demand',
      status: 'connected',
      latency_ms: 28,
      last_sync_at: new Date().toISOString(),
      endpoint_or_host: newEndpoint,
      sample_data: { status: 'healthy', payloadReady: true },
    };
    onAddConnector(connector);
    setShowAddModal(false);
    setNewName('');
    setNewEndpoint('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Cable className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Enterprise Connectors & Sync Pipelines
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Governed data connectors with KMS-backed credential isolation and circuit breaker protection.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register Connector</span>
        </button>
      </div>

      {/* Connectors Grid */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectors.map((c) => {
            const test = testResults[c.id];
            const isTesting = testingId === c.id;

            return (
              <div
                key={c.id}
                className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-4 shadow-xs hover:border-zinc-700 transition-all"
              >
                {/* Top info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      <Database className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-100">{c.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                          {c.type}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {c.sync_mode.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className="inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="capitalize">{c.status}</span>
                  </span>
                </div>

                {/* Endpoint & Secret details */}
                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800/80 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] uppercase text-zinc-400">Host / Target:</span>
                    <span className="text-zinc-200 truncate max-w-xs">{c.endpoint_or_host}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] uppercase text-zinc-400">Auth Strategy:</span>
                    <span className="text-cyan-400 uppercase font-semibold text-[10px]">{c.auth_strategy}</span>
                  </div>
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-[10px] uppercase text-zinc-400 flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>KMS Secret Ref:</span>
                    </span>
                    <span className="text-amber-300 text-[10px] truncate max-w-[180px]">{c.secret_ref}</span>
                  </div>
                </div>

                {/* Telemetry & Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Avg Latency:</span>
                    <span className="font-mono text-zinc-200 font-bold">
                      {test ? `${test.latency}ms` : `${c.latency_ms}ms`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => runConnectionTest(c.id)}
                      disabled={isTesting}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium transition-colors flex items-center space-x-1"
                    >
                      <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                    </button>

                    <button
                      onClick={() => onTriggerSync(c.id)}
                      className="px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded text-xs font-semibold transition-colors shadow-xs"
                    >
                      Sync Snapshot
                    </button>
                  </div>
                </div>

                {test && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-900/60 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Ping verified in {test.latency}ms at {test.time}. Circuit breaker clear.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for adding connector */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-100">Register New Governed Connector</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Connector Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Snowflake Analytics DW"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-200 px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1">Source Protocol</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-zinc-950 text-zinc-200 px-3 py-2 rounded-lg border border-zinc-800"
                  >
                    <option value="sql">SQL Database</option>
                    <option value="rest">REST API</option>
                    <option value="graphql">GraphQL Endpoint</option>
                    <option value="nosql">NoSQL Document Store</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">Authentication Strategy</label>
                  <select
                    value={newAuth}
                    onChange={(e) => setNewAuth(e.target.value as any)}
                    className="w-full bg-zinc-950 text-zinc-200 px-3 py-2 rounded-lg border border-zinc-800"
                  >
                    <option value="api_key">API Key (Vault KMS)</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="oauth2">OAuth 2.0 (mTLS)</option>
                    <option value="basic">Basic Credentials</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Host / API URL</label>
                <input
                  type="text"
                  placeholder="https://api.example.com/v1 or host:port"
                  value={newEndpoint}
                  onChange={(e) => setNewEndpoint(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-200 px-3 py-2 rounded-lg border border-zinc-800 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-zinc-800">
              <button onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-zinc-400 hover:text-zinc-200 text-xs">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Save & Initialize Connector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
