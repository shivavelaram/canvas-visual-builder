import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  GitCompare,
  Sliders,
  Layers,
  HelpCircle,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { AIJob, CanvasNode, ComponentDef, DataModel } from '../../types/canvas';
import { generateAIProposal } from '../../services/aiEngine';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNodes: CanvasNode[];
  componentRegistry: Record<string, ComponentDef>;
  dataModels: Record<string, DataModel>;
  selectedNodeId?: string | null;
  onAcceptProposal: (job: AIJob) => void;
  onRejectProposal: (job: AIJob, reason: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  currentNodes,
  componentRegistry,
  dataModels,
  selectedNodeId,
  onAcceptProposal,
  onRejectProposal,
}) => {
  const [prompt, setPrompt] = useState('');
  const [kind, setKind] = useState<'layout-gen' | 'mapping-suggest' | 'transform-draft'>('layout-gen');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeJob, setActiveJob] = useState<AIJob | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = (customPrompt?: string, customKind?: 'layout-gen' | 'mapping-suggest' | 'transform-draft') => {
    const text = customPrompt || prompt || 'Build an executive store operations dashboard with KPI metrics and live orders table';
    const activeKind = customKind || kind;

    setIsGenerating(true);
    setTimeout(() => {
      const job = generateAIProposal(activeKind, text, {
        currentNodes,
        componentRegistry,
        dataModels,
        selectedNodeId: selectedNodeId || undefined,
      });
      setActiveJob(job);
      setIsGenerating(false);
    }, 600);
  };

  const handleAccept = () => {
    if (!activeJob) return;
    onAcceptProposal(activeJob);
    setActiveJob(null);
    onClose();
  };

  const handleReject = () => {
    if (!activeJob) return;
    onRejectProposal(activeJob, rejectionReason || 'User opted for manual composition.');
    setActiveJob(null);
    setShowRejectInput(false);
    setRejectionReason('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden text-zinc-100">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-zinc-100">AI Assistant Engine & Human Review Gate</h3>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-violet-950 text-violet-300 border border-violet-800/60 font-semibold">
                  Section 12 Spec
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                AI generates structured proposals only. Never silently published — explicit human review and approval required.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-zinc-400 hover:text-white text-sm p-1">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick presets and Prompt Bar */}
          {!activeJob && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                Select Structured Capability
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setKind('layout-gen');
                    handleGenerate('Build an executive store operations dashboard with KPI metrics and live orders table', 'layout-gen');
                  }}
                  className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-violet-500 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Layers className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-violet-300">
                      Layout Generation
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Derive multi-component dashboard layout tree from active data models.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setKind('mapping-suggest');
                    handleGenerate('Auto-map orders_v3 schema fields to selected component props with transforms', 'mapping-suggest');
                  }}
                  className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-violet-500 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <Sliders className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-cyan-300">
                      Mapping Suggestion
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Auto-pair data model columns to component prop contracts with safe transformers.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setKind('transform-draft');
                    handleGenerate('Generate deterministic currency & percentage formatter operator pipeline', 'transform-draft');
                  }}
                  className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-violet-500 text-left transition-all group"
                >
                  <div className="flex items-center space-x-2 mb-1.5">
                    <FileCheck className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-zinc-200 group-hover:text-amber-300">
                      Transform Drafting
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Author pure mathematical operator chain for data extraction and formatting.
                  </p>
                </button>
              </div>

              {/* Custom Prompt Input */}
              <div className="mt-4">
                <label className="text-xs text-zinc-400 font-semibold block mb-1.5">
                  Or enter natural language instructions:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Build a customer 360 dashboard with orders and balance cards"
                    className="flex-1 bg-zinc-950 text-xs text-zinc-100 px-3.5 py-2.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-violet-500 font-medium"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleGenerate();
                    }}
                  />
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Synthesizing...' : 'Generate Proposal'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Proposal Review Diff View */}
          {activeJob && (
            <div className="space-y-4">
              {/* Proposal Header Banner */}
              <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                      Proposal #{activeJob.id} • Status: PENDING HUMAN APPROVAL
                    </span>
                    <h4 className="text-base font-bold text-zinc-100 mt-0.5">{activeJob.proposal.title}</h4>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{activeJob.proposal.rationale}</p>
                  </div>

                  {/* Confidence Score Pill */}
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Confidence</span>
                    <span className="text-lg font-bold font-mono text-emerald-400">
                      {Math.round(activeJob.confidence * 100)}%
                    </span>
                  </div>
                </div>

                {/* Confidence breakdown bars */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80 font-mono text-[10px]">
                  <div>
                    <span className="text-zinc-400">Schema Match:</span>{' '}
                    <span className="text-emerald-400 font-semibold">
                      {Math.round(activeJob.proposal.confidence_breakdown.schema_match * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Prop Coverage:</span>{' '}
                    <span className="text-emerald-400 font-semibold">
                      {Math.round(activeJob.proposal.confidence_breakdown.prop_coverage * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400">Structural Fit:</span>{' '}
                    <span className="text-emerald-400 font-semibold">
                      {Math.round(activeJob.proposal.confidence_breakdown.structural_fit * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Diff Box */}
              <div className="grid grid-cols-2 gap-4">
                {/* Current State */}
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-semibold text-zinc-400">Current Canvas State</span>
                    <span className="text-[10px] font-mono text-zinc-500">{currentNodes.length} nodes</span>
                  </div>
                  <div className="text-xs text-zinc-300 font-mono space-y-1 max-h-48 overflow-y-auto">
                    {currentNodes.map((n, i) => (
                      <div key={n.id} className="p-1.5 bg-zinc-900 rounded text-[11px] truncate">
                        {i + 1}. {n.name || n.componentId}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Proposed State */}
                <div className="bg-violet-950/20 rounded-xl border border-violet-800/60 p-4 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-violet-800/40">
                    <span className="text-xs font-semibold text-violet-300">Proposed Changes</span>
                    <span className="text-[10px] font-mono text-violet-400">Structured Patch</span>
                  </div>
                  <div className="text-xs text-zinc-200 leading-relaxed">
                    <p className="text-[11px] text-zinc-300">{activeJob.proposal.changes.description}</p>
                    {activeJob.proposal.changes.diffNodes && (
                      <div className="mt-2 space-y-1 font-mono text-[11px] max-h-44 overflow-y-auto">
                        {activeJob.proposal.changes.diffNodes.map((dn, idx) => (
                          <div
                            key={dn.id}
                            className="p-1.5 bg-violet-950/50 text-violet-200 border border-violet-800/40 rounded truncate flex items-center justify-between"
                          >
                            <span>+ {dn.name || dn.componentId}</span>
                            <span className="text-[9px] uppercase bg-violet-900 px-1 rounded">{dn.componentId}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection input if triggered */}
              {showRejectInput && (
                <div className="p-3 bg-zinc-950 rounded-lg border border-rose-900/60 space-y-2">
                  <label className="text-xs text-rose-300 font-semibold block">
                    Reason for Discarding Proposal (Audited in Compliance Trail):
                  </label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="e.g. Unneeded metric card or preferred custom layout"
                    className="w-full bg-zinc-900 text-xs text-zinc-200 px-3 py-1.5 rounded border border-zinc-800 focus:outline-none"
                  />
                  <div className="flex justify-end space-x-2 pt-1">
                    <button
                      onClick={() => setShowRejectInput(false)}
                      className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold"
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}

              {/* Human Approval Action Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                <button
                  onClick={() => {
                    setActiveJob(null);
                    setShowRejectInput(false);
                  }}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  ← Try Another Prompt
                </button>

                <div className="flex items-center space-x-3">
                  {!showRejectInput && (
                    <button
                      onClick={() => setShowRejectInput(true)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-rose-950 hover:text-rose-300 text-zinc-300 rounded-lg text-xs font-medium transition-colors border border-zinc-700 hover:border-rose-800"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject Proposal</span>
                    </button>
                  )}

                  <button
                    onClick={handleAccept}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition-all active:scale-[0.98]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Apply to Draft</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Governance Guarantee: All AI suggestions are recorded with actor_type="ai" and human reviewer signature.</span>
          </div>
          <span className="font-mono text-[10px]">Zero Unreviewed Publishes</span>
        </div>
      </div>
    </div>
  );
};
