import React, { useState } from 'react';
import {
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Globe,
  Lock,
  Clock,
  User,
  ShieldCheck,
  FileCheck,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { PageVersion, CanvasNode, ComponentDef, DataModel } from '../../types/canvas';
import { validatePageTreeForPublish, PublishValidationReport } from '../../services/schemaValidator';

interface ReleaseManagerProps {
  pageVersions: PageVersion[];
  currentDraftNodes: CanvasNode[];
  componentRegistry: Record<string, ComponentDef>;
  dataModels: Record<string, DataModel>;
  resolvedPropsMap: Record<string, Record<string, any>>;
  onPublishVersion: (changelog: string) => void;
  onRollbackToVersion: (version: PageVersion) => void;
}

export const ReleaseManager: React.FC<ReleaseManagerProps> = ({
  pageVersions,
  currentDraftNodes,
  componentRegistry,
  dataModels,
  resolvedPropsMap,
  onPublishVersion,
  onRollbackToVersion,
}) => {
  const [changelog, setChangelog] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(pageVersions[0]?.id || '');

  // Run schema validation gate on current draft
  const validationReport: PublishValidationReport = validatePageTreeForPublish(
    currentDraftNodes,
    componentRegistry,
    dataModels,
    resolvedPropsMap
  );

  const publishedVersion = pageVersions.find((v) => v.status === 'published');
  const selectedVersion = pageVersions.find((v) => v.id === selectedVersionId) || pageVersions[0];

  const handlePublish = () => {
    if (!validationReport.canPublish) return;
    setIsPublishing(true);
    setTimeout(() => {
      onPublishVersion(changelog || 'Production release with updated component bindings.');
      setChangelog('');
      setIsPublishing(false);
    }, 500);
  };

  return (
    <div className="flex-1 flex h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Sidebar: Version Timeline */}
      <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Version Registry</h3>
            <span className="text-[10px] text-zinc-500 font-mono">Immutable Release Graph</span>
          </div>
          <span className="text-[10px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">
            {pageVersions.length} Releases
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {pageVersions.map((v) => {
            const isCurrentProd = v.status === 'published';
            const isDraft = v.status === 'draft';

            return (
              <div
                key={v.id}
                onClick={() => setSelectedVersionId(v.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer ${
                  selectedVersion?.id === v.id
                    ? 'bg-zinc-800/90 border-indigo-500/70 shadow-xs ring-1 ring-indigo-500/30'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-800/40 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-xs text-zinc-100 font-mono">{v.version_number}</span>
                    {isCurrentProd && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                        LIVE PROD
                      </span>
                    )}
                    {isDraft && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-amber-950 text-amber-400 border border-amber-800/60">
                        DRAFT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(v.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {v.changelog || 'Automated layout & data snapshot.'}
                </p>

                <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{v.layout_tree.length} nodes</span>
                  <span className="truncate max-w-[130px]">{v.created_by.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Callout */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 text-[10px] text-zinc-400 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Published versions are immutable. Rollback flips pointers instantaneously.</span>
        </div>
      </div>

      {/* Main Release Panel */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
        {/* Pre-Publish Validation Gate */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <FileCheck className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Publish Pre-Flight Schema Gate</h3>
                <span className="text-xs text-zinc-400">
                  Strict prop contract and allowlist validation before promotion to Production CDN.
                </span>
              </div>
            </div>

            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                validationReport.canPublish
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-rose-950 text-rose-400 border border-rose-800'
              }`}
            >
              {validationReport.canPublish ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pass: Ready to Publish</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Fail: Contract Violations</span>
                </>
              )}
            </span>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-4 gap-3 bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Total Nodes</span>
              <span className="text-base font-bold text-zinc-200">{validationReport.totalNodes}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Bound Props</span>
              <span className="text-base font-bold text-indigo-400">{validationReport.totalBoundProps}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Schema Errors</span>
              <span className={`text-base font-bold ${validationReport.errors.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {validationReport.errors.length}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase block">Warnings</span>
              <span className="text-base font-bold text-amber-400">{validationReport.warnings.length}</span>
            </div>
          </div>

          {/* Publish Input Form */}
          <div className="space-y-3 pt-2">
            <label className="text-xs text-zinc-300 font-semibold block">
              Release Changelog & Notes (Immutable Audit Entry):
            </label>
            <input
              type="text"
              placeholder="e.g. Added real-time Stripe payout metric card and verified Postgres binding."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              className="w-full bg-zinc-950 text-xs text-zinc-200 px-3 py-2 rounded-lg border border-zinc-800 focus:outline-none focus:border-indigo-500 font-medium"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-500">
                Target: Production Edge CDN (us-east-1, eu-west-1, ap-southeast-1)
              </span>

              <button
                onClick={handlePublish}
                disabled={!validationReport.canPublish || isPublishing}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold shadow-md transition-all ${
                  validationReport.canPublish && !isPublishing
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/20 active:scale-[0.98]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isPublishing ? 'Deploying to CDN...' : 'Promote & Publish Release'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Selected Version Inspector & Rollback */}
        {selectedVersion && (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-4 shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-zinc-100">Release Inspector: {selectedVersion.version_number}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                    Status: {selectedVersion.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  Authored by <span className="text-zinc-200 font-medium">{selectedVersion.created_by}</span> on{' '}
                  {new Date(selectedVersion.created_at).toLocaleString()}
                </p>
              </div>

              {/* Rollback Button */}
              {selectedVersion.status !== 'draft' && selectedVersion.id !== publishedVersion?.id && (
                <button
                  onClick={() => onRollbackToVersion(selectedVersion)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Instant Rollback to this Version</span>
                </button>
              )}
            </div>

            {selectedVersion.cdn_artifact_hash && (
              <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 font-mono text-xs text-zinc-400 flex items-center justify-between">
                <span>CDN Artifact Pointer:</span>
                <span className="text-indigo-400 truncate max-w-md font-semibold">
                  {selectedVersion.cdn_artifact_hash}
                </span>
              </div>
            )}

            {/* Layout tree snapshot */}
            <div>
              <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider block mb-2">
                Snapshotted Component Tree ({selectedVersion.layout_tree.length} Root Nodes)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
                {selectedVersion.layout_tree.map((node, i) => (
                  <div key={node.id} className="p-2.5 bg-zinc-950 rounded border border-zinc-800 flex items-center justify-between">
                    <span className="text-zinc-200 font-medium">
                      {i + 1}. {node.name || node.componentId}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">{node.componentId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
