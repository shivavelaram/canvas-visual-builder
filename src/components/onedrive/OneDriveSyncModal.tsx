import React, { useState } from 'react';
import { Website, OneDriveConfig, AuthUser } from '../../types/canvas';
import {
  syncSQLiteToOneDrive,
  downloadSQLiteFile,
} from '../../services/sqliteOneDriveBridge';
import {
  Cloud,
  Database,
  CheckCircle2,
  RefreshCw,
  Download,
  FolderSync,
  ShieldCheck,
  AlertTriangle,
  Lock,
  X,
  ExternalLink,
} from 'lucide-react';

interface OneDriveSyncModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  config: OneDriveConfig;
  websites: Website[];
  onClose: () => void;
  onUpdateConfig: (newConfig: OneDriveConfig) => void;
  onOpenLogin: () => void;
}

export const OneDriveSyncModal: React.FC<OneDriveSyncModalProps> = ({
  isOpen,
  currentUser,
  config,
  websites,
  onClose,
  onUpdateConfig,
  onOpenLogin,
}) => {
  const [folderPath, setFolderPath] = useState(config.folderPath);
  const [sqliteFileName, setSqliteFileName] = useState(config.sqliteFileName);
  const [clientId, setClientId] = useState(config.clientId || 'app-canvas-studio-enterprise');
  const [autoSync, setAutoSync] = useState(config.autoSync);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';

  const handleConnect = () => {
    if (!isAdmin) return;
    const updated: OneDriveConfig = {
      ...config,
      isConnected: true,
      folderPath,
      sqliteFileName,
      clientId,
      autoSync,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: 'synced',
    };
    onUpdateConfig(updated);
    setSyncFeedback('OneDrive folder connection established by Admin.');
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      const res = await syncSQLiteToOneDrive(config, websites);
      const updated: OneDriveConfig = {
        ...config,
        lastSyncedAt: res.syncedAt,
        syncStatus: 'synced',
        dbSizeBytes: res.byteSize,
      };
      onUpdateConfig(updated);
      setSyncFeedback(res.message);
    } catch (err) {
      console.error(err);
      setSyncFeedback('Failed to sync with OneDrive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadDb = () => {
    downloadSQLiteFile(websites, config.sqliteFileName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-zinc-200 overflow-hidden text-zinc-900">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-zinc-900">OneDrive & SQLite Dynamic Store</h3>
                {config.isConnected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Connected
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Setup Required
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">
                Persistent database storage for static GitHub Pages sites
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

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Architecture Explanation */}
          <div className="bg-sky-50/80 border border-sky-200/80 rounded-xl p-3.5 text-xs text-sky-950 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-sky-900">
              <FolderSync className="w-4 h-4 text-sky-600" />
              <span>Hybrid Static + Dynamic Architecture</span>
            </div>
            <p className="text-[11px] text-sky-900/80 leading-relaxed">
              <strong>GitHub Pages (`github.io`)</strong> serves the fast, zero-cost static frontend. Dynamic content, form leads, and website changes are persisted in an <strong>SQLite database file</strong> hosted inside your <strong>OneDrive folder</strong> via Microsoft Graph API.
            </p>
          </div>

          {/* Admin Authentication Gate */}
          {!isAdmin ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-950">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Admin Login Required for One-Time Connection</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Only authenticated administrators can configure or update the OneDrive cloud storage credentials and SQLite database paths.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="mt-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
              >
                Sign In as Admin
              </button>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Admin Authorization Verified: <strong>{currentUser.email}</strong></span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
          )}

          {/* Configuration Form */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                OneDrive Destination Folder
              </label>
              <input
                type="text"
                disabled={!isAdmin}
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                placeholder="/OneDrive/Apps/CanvasStudio/db/"
                className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono text-zinc-800 disabled:bg-zinc-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  SQLite Database Filename
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={sqliteFileName}
                  onChange={(e) => setSqliteFileName(e.target.value)}
                  placeholder="canvas_store.sqlite"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono text-zinc-800 disabled:bg-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">
                  Microsoft Graph App Client ID
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  placeholder="app-canvas-studio-enterprise"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono text-zinc-800 disabled:bg-zinc-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span className="font-medium">Auto-sync database on webpage edits & saves</span>
              </label>

              {isAdmin && !config.isConnected && (
                <button
                  type="button"
                  onClick={handleConnect}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Save & Connect
                </button>
              )}
            </div>
          </div>

          {/* Sync Status Card */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Database Status:</span>
              <span className="font-mono font-semibold text-zinc-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" />
                {config.sqliteFileName} ({((config.dbSizeBytes || 42800) / 1024).toFixed(1)} KB)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Last Synced to OneDrive:</span>
              <span className="text-zinc-800 font-medium">
                {config.lastSyncedAt
                  ? new Date(config.lastSyncedAt).toLocaleString()
                  : 'Pending initial sync'}
              </span>
            </div>

            {syncFeedback && (
              <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{syncFeedback}</span>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleDownloadDb}
                className="px-3 py-1.5 rounded-lg border border-zinc-300 hover:bg-white text-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .sqlite File</span>
              </button>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync to OneDrive Now'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
