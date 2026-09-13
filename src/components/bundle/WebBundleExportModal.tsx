import React, { useState } from 'react';
import { Website } from '../../types/canvas';
import { downloadWebBundleZip } from '../../services/bundleGenerator';
import {
  Download,
  FolderArchive,
  Server,
  FileCode,
  FileText,
  CheckCircle2,
  Terminal,
  X,
  PlayCircle,
  Database,
  Share2,
} from 'lucide-react';

interface WebBundleExportModalProps {
  isOpen: boolean;
  website: Website;
  onClose: () => void;
}

export const WebBundleExportModal: React.FC<WebBundleExportModalProps> = ({
  isOpen,
  website,
  onClose,
}) => {
  const [port, setPort] = useState<number>(3000);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportComplete, setExportComplete] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await downloadWebBundleZip(website, port);
      setExportComplete(true);
    } catch (err) {
      console.error('Failed to bundle web package:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-zinc-200 overflow-hidden text-zinc-900">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Export Runnable Node.js Web Bundle</h3>
              <p className="text-xs text-zinc-500">
                Package all {website.pages.length} webpages into a self-contained Express + GraphQL server
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

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Bundle Overview Card */}
          <div className="bg-zinc-900 text-white rounded-xl p-4 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-zinc-400 pb-2 border-b border-zinc-800">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bundle Contents: {website.name}</span>
              </span>
              <span className="text-emerald-400">Ready to package (.zip)</span>
            </div>
            <div className="space-y-1.5 text-zinc-300 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-indigo-300 font-semibold">📁 public/</span>
                <span className="text-zinc-500">{website.pages.length} compiled HTML files</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-sky-300">
                <span className="font-semibold">☁️ OneDrive Folder:</span>
                <span className="font-mono text-zinc-400 truncate max-w-[240px]">
                  {website.oneDriveFolder || `/Apps/CanvasStudio/Projects/${website.id}/`}
                </span>
              </div>
              {website.pages.map((p) => (
                <div key={p.id} className="pl-4 text-[11px] text-zinc-400 flex items-center justify-between">
                  <span>📄 {p.slug === 'home' ? 'index.html' : `${p.slug}.html`}</span>
                  <span className="text-zinc-500 font-sans">({p.title})</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-1">
                <span className="text-amber-300 font-semibold">⚡ server.js</span>
                <span className="text-zinc-500">Standalone Express + GraphQL Router</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">💾 schema.sql & database.json</span>
                <span className="text-zinc-500">SQLite persistence & seed data</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-300 font-semibold">📦 package.json & README.md</span>
                <span className="text-zinc-500">Zero-config npm startup script</span>
              </div>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                Local Server Port
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(Number(e.target.value))}
                  min={1024}
                  max={65535}
                  className="w-28 px-3 py-1.5 text-xs font-mono rounded-lg border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
                />
                <span className="text-[11px] text-zinc-500">Default: 3000</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5">
                Website URL will be http://localhost:{port}
              </p>
            </div>

            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <label className="text-xs font-bold text-zinc-700 block mb-1.5">
                Dynamic Database Engine
              </label>
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>SQLite + GraphQL Bridge</span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5">
                Syncs form leads and CMS data into SQLite.
              </p>
            </div>
          </div>

          {/* Execution steps */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-indigo-600" />
              <span>How to run on your local machine / server:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-indigo-900/90 pl-1 text-[11px]">
              <li>Unzip the downloaded archive folder.</li>
              <li>Open your terminal in the directory and run <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">npm install</code>.</li>
              <li>Run <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">npm start</code> to launch the web server.</li>
              <li>Open <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 font-mono">http://localhost:{port}</code> in your browser!</li>
            </ol>
          </div>

          {exportComplete && (
            <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-xl font-medium animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Web bundle <strong>{website.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-web-bundle.zip</strong> has been downloaded to your computer!
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Packaging Web Bundle...' : 'Download Web Bundle (.zip)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
