import React, { useState } from 'react';
import { Website } from '../../types/canvas';
import { executeGraphQLQuery } from '../../services/sqliteOneDriveBridge';
import {
  Code,
  Play,
  Copy,
  Check,
  Zap,
  Database,
  Layers,
  ArrowRight,
  Terminal,
  X,
} from 'lucide-react';

interface GraphQLBridgeModalProps {
  isOpen: boolean;
  website: Website;
  onClose: () => void;
}

const SAMPLE_QUERIES = [
  {
    title: '1. List All Webpages',
    query: `query ListWebsitePages {
  pages {
    id
    title
    slug
    description
    sectionsCount
  }
}`,
    variables: {},
  },
  {
    title: '2. Get Page by Slug with Sections',
    query: `query GetPageDetails($slug: String!) {
  getPage(slug: $slug) {
    id
    title
    slug
    description
    updatedAt
    sections {
      id
      componentId
      props
    }
  }
}`,
    variables: { slug: 'pricing' },
  },
  {
    title: '3. Submit Dynamic Lead (Mutation)',
    query: `mutation RecordLead($email: String!, $pageSlug: String!) {
  submitLead(email: $email, pageSlug: $pageSlug) {
    success
    message
    leadId
    timestamp
  }
}`,
    variables: { email: 'growth@enterprise.com', pageSlug: 'home' },
  },
  {
    title: '4. Website Dynamic Metadata',
    query: `query GetWebsiteOverview {
  website {
    name
    domain
    category
    totalPages
    graphQLEndpoint
    dbSource
  }
}`,
    variables: {},
  },
];

export const GraphQLBridgeModal: React.FC<GraphQLBridgeModalProps> = ({
  isOpen,
  website,
  onClose,
}) => {
  const [selectedSample, setSelectedSample] = useState(0);
  const [query, setQuery] = useState(SAMPLE_QUERIES[0].query);
  const [variables, setVariables] = useState(JSON.stringify(SAMPLE_QUERIES[0].variables, null, 2));
  const [result, setResult] = useState<string | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectSample = (index: number) => {
    setSelectedSample(index);
    setQuery(SAMPLE_QUERIES[index].query);
    setVariables(JSON.stringify(SAMPLE_QUERIES[index].variables, null, 2));
    setResult(null);
  };

  const handleExecute = () => {
    try {
      let parsedVars = {};
      if (variables.trim()) {
        parsedVars = JSON.parse(variables);
      }
      const data = executeGraphQLQuery(query, parsedVars, website);
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResult(JSON.stringify({ errors: [{ message: err.message }] }, null, 2));
    }
  };

  const handleCopyClientCode = () => {
    const code = `// Static Frontend GraphQL Client (Runs on GitHub Pages)
async function fetchGraphQL(query, variables = {}) {
  const response = await fetch('https://api.apexcloud.io/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const { data, errors } = await response.json();
  if (errors) console.error(errors);
  return data;
}`;
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-zinc-200 overflow-hidden text-zinc-900 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">GraphQL Dynamic Bridge Explorer</h3>
              <p className="text-xs text-zinc-500">
                Connects static frontend pages to dynamic SQLite data stored in OneDrive
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Flow Visualizer */}
          <div className="bg-zinc-900 text-white rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-indigo-400 font-bold">
                🌐
              </div>
              <div>
                <span className="font-bold block text-zinc-200">GitHub Pages (Static)</span>
                <span className="text-[11px] text-zinc-400">{website.domain}</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-violet-400 font-mono text-[11px]">
              <span>POST /graphql</span>
              <ArrowRight className="w-4 h-4 text-violet-400 animate-pulse" />
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-950 border border-violet-700 flex items-center justify-center text-violet-300 font-bold">
                ⚡
              </div>
              <div>
                <span className="font-bold block text-zinc-200">GraphQL Resolver</span>
                <span className="text-[11px] text-zinc-400">Node.js Express</span>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-[11px]">
              <span>SQL Query</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-300 font-bold">
                💾
              </div>
              <div>
                <span className="font-bold block text-zinc-200">OneDrive / SQLite</span>
                <span className="text-[11px] text-zinc-400">canvas_store.sqlite</span>
              </div>
            </div>
          </div>

          {/* Sample Query Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {SAMPLE_QUERIES.map((sample, idx) => (
              <button
                key={sample.title}
                onClick={() => handleSelectSample(idx)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedSample === idx
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900'
                }`}
              >
                {sample.title}
              </button>
            ))}
          </div>

          {/* Interactive Playground Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Query Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-violet-600" />
                  <span>GraphQL Query & Mutation</span>
                </span>
              </div>
              <textarea
                rows={9}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-zinc-950 text-emerald-400 p-3 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 border border-zinc-800"
              />

              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block pt-1">
                Variables (JSON)
              </label>
              <textarea
                rows={3}
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                className="w-full bg-zinc-950 text-indigo-300 p-2.5 rounded-xl font-mono text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 border border-zinc-800"
              />
            </div>

            {/* Live Response */}
            <div className="space-y-2 flex flex-col">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SQLite Live JSON Response</span>
                </span>
                {result && (
                  <span className="text-[10px] text-emerald-600 font-mono font-semibold">
                    HTTP 200 OK
                  </span>
                )}
              </div>
              <div className="flex-1 bg-zinc-950 text-zinc-200 p-3.5 rounded-xl font-mono text-xs border border-zinc-800 overflow-y-auto max-h-[300px]">
                {result ? (
                  <pre className="text-zinc-200">{result}</pre>
                ) : (
                  <div className="text-zinc-500 italic py-12 text-center">
                    Click "Run GraphQL Query" to execute against SQLite...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleCopyClientCode}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{hasCopied ? 'Code Copied!' : 'Copy Frontend JS Client'}</span>
          </button>

          <button
            type="button"
            onClick={handleExecute}
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run GraphQL Query</span>
          </button>
        </div>
      </div>
    </div>
  );
};
