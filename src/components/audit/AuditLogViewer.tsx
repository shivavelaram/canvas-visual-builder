import React, { useState } from 'react';
import {
  ShieldCheck,
  Filter,
  User,
  Sparkles,
  Cpu,
  Clock,
  Search,
  CheckCircle2,
  FileText,
  Layers,
} from 'lucide-react';
import { AuditRecord } from '../../types/canvas';

interface AuditLogViewerProps {
  logs: AuditRecord[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [filterActor, setFilterActor] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filteredLogs = logs.filter((record) => {
    const matchesActor = filterActor === 'all' || record.actor_type === filterActor;
    const matchesEntity = filterEntity === 'all' || record.entity_type === filterEntity;
    const matchesSearch =
      record.summary.toLowerCase().includes(search.toLowerCase()) ||
      record.action.toLowerCase().includes(search.toLowerCase()) ||
      record.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      record.entity_id.toLowerCase().includes(search.toLowerCase());

    return matchesActor && matchesEntity && matchesSearch;
  });

  const getActorBadge = (type: 'user' | 'system' | 'ai') => {
    switch (type) {
      case 'ai':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-violet-950 text-violet-300 border border-violet-800/60">
            <Sparkles className="w-2.5 h-2.5" />
            <span>AI Copilot</span>
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-950 text-indigo-300 border border-indigo-800/60">
            <User className="w-2.5 h-2.5" />
            <span>Human User</span>
          </span>
        );
      case 'system':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Cpu className="w-2.5 h-2.5" />
            <span>System Daemon</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-100">
              Append-Only Governance & Compliance Audit Trail
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cryptographically sealed audit log recording human, system, and AI state changes. Immutability guaranteed.
          </p>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
          {filteredLogs.length} Audited Events
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3 bg-zinc-900 border-b border-zinc-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search actions, entities, actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-950 text-xs text-zinc-200 pl-8 pr-3 py-1.5 rounded-md border border-zinc-800 focus:outline-none focus:border-indigo-500 w-64"
            />
          </div>

          {/* Actor filter */}
          <div className="flex items-center space-x-1">
            <span className="text-zinc-500 text-[11px]">Actor:</span>
            {['all', 'user', 'ai', 'system'].map((a) => (
              <button
                key={a}
                onClick={() => setFilterActor(a)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                  filterActor === a
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Entity filter */}
          <div className="flex items-center space-x-1">
            <span className="text-zinc-500 text-[11px]">Entity:</span>
            {['all', 'page', 'version', 'connector', 'transform', 'ai_job'].map((e) => (
              <button
                key={e}
                onClick={() => setFilterEntity(e)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                  filterEntity === e
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {e.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 space-y-2.5 shadow-xs hover:border-zinc-700 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                {getActorBadge(log.actor_type)}
                <span className="text-xs font-bold text-zinc-100">{log.actor_name}</span>
                <span className="font-mono text-xs text-indigo-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                  {log.action}
                </span>
              </div>

              <span className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(log.created_at).toLocaleString()}</span>
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed pl-1">{log.summary}</p>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70 text-[11px] font-mono text-zinc-500">
              <div className="flex items-center space-x-3">
                <span>
                  Entity: <span className="text-zinc-300 uppercase">{log.entity_type}</span> ({log.entity_id})
                </span>
                {log.reviewed_by && (
                  <span className="text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Human Approver: {log.reviewed_by}</span>
                  </span>
                )}
              </div>

              <span className="text-zinc-600">ID: {log.id}</span>
            </div>
          </div>
        ))}

        {filteredLogs.length === 0 && (
          <div className="text-center py-12 text-zinc-500 text-xs">
            No audit records match the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
