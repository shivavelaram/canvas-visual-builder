import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  User,
  X,
  Search,
  CheckCircle2,
  Terminal,
  FolderLock,
  Globe,
  Database,
  Cloud,
  Layers,
  Sparkles,
  Copy,
  Check,
  Download,
  KeyRound,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface DocumentationManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'admin' | 'user';
}

export const DocumentationManualModal: React.FC<DocumentationManualModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'user',
}) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'user'>(defaultRole);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-zinc-200 overflow-hidden text-zinc-900 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900">Canvas Studio User & Admin Manual</h2>
              <p className="text-xs text-zinc-500">
                Official guide for website development, OneDrive SQLite synchronization, page menu linking & deployment
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Role Switcher Pill */}
            <div className="flex items-center bg-zinc-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('user')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'user'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>User Manual</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'admin'
                    ? 'bg-white text-purple-700 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Manual</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-2.5 bg-zinc-100/50 border-b border-zinc-200 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center space-x-2 w-full max-w-sm">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder={`Search in ${activeTab === 'admin' ? 'Administrator' : 'User'} Manual...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-hidden text-xs text-zinc-800 placeholder-zinc-400"
            />
          </div>
          <div className="text-[11px] text-zinc-400 font-mono hidden sm:block">
            Section: {activeTab === 'admin' ? 'Governance, Security & Sync' : 'Website Building & Deployment'}
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-xs text-zinc-700 leading-relaxed">
          {/* ============================================================== */}
          {/* USER MANUAL TAB */}
          {/* ============================================================== */}
          {activeTab === 'user' && (
            <div className="space-y-8">
              {/* Introduction Hero */}
              <div className="bg-gradient-to-br from-indigo-50 via-white to-white p-5 rounded-2xl border border-indigo-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Creator & Developer Guide
                </span>
                <h3 className="text-base font-bold text-zinc-900 mt-2">
                  Building Multi-Page Websites in Canvas Studio
                </h3>
                <p className="mt-1 text-zinc-600">
                  Welcome to Canvas Studio! This guide will walk you through logging in with your email ID,
                  creating new website projects, building multiple interconnected pages, configuring top navigation menus,
                  and exporting your project as a runnable Node.js web server.
                </p>
              </div>

              {/* Step 1: Authentication */}
              <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Sign In or Register with Your Email ID
                </h4>
                <p>
                  On the home page, enter your registered email address and password. If you do not have an account yet,
                  switch to the <strong>Register Account</strong> tab.
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-600 pl-1">
                  <li>Your password is encrypted using a unique 128-bit cryptographic salt and SHA-256 hash.</li>
                  <li>Plaintext passwords are never stored or transmitted.</li>
                  <li>Once logged in, you will be granted access to your assigned projects.</li>
                </ul>
              </div>

              {/* Step 2: Creating a Website Project */}
              <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  Create a New Website Development Project
                </h4>
                <p>
                  You can create websites beyond the default Apex Cloud SaaS platform (e.g. E-Commerce Stores, Portfolios, Corporate Portals, Documentation):
                </p>
                <ol className="list-decimal list-inside space-y-1 text-zinc-600 pl-1">
                  <li>Click the website dropdown in the top bar and select <strong>+ Create Website Project</strong>.</li>
                  <li>Provide a name (e.g. <em>"Aura Lifestyle Storefront"</em> or <em>"Acme Corporate"</em>) and choose a category.</li>
                  <li>The system automatically provisions a dedicated OneDrive folder path: <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-indigo-600">/Apps/CanvasStudio/Projects/your-site/</code>.</li>
                  <li>As the creator, you are automatically designated as the <strong>Project Owner</strong>.</li>
                </ol>
              </div>

              {/* Step 3: Building Multiple Pages & Menu Linker */}
              <div className="space-y-3 border-l-2 border-indigo-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  Build Multiple Pages and Link Them with Menu Navigation
                </h4>
                <p>
                  A complete website requires multiple pages linked together. Canvas Studio provides a built-in <strong>Website Navigation Menu Linker</strong>:
                </p>
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-2">
                  <div className="font-semibold text-zinc-800">How to add and link pages:</div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-600">
                    <li><strong>Add Pages:</strong> Click the page pill next to the website switcher and click <strong>+ Add Page</strong> (e.g. <code>/about</code>, <code>/pricing</code>, <code>/catalog</code>, <code>/contact</code>).</li>
                    <li><strong>Open Menu Linker:</strong> Click <strong>Link Menu Items</strong> in the page dropdown.</li>
                    <li><strong>Connect Routes:</strong> Map each navigation label to an internal page (e.g. "Pricing" → <code>/pricing</code>) or external URL.</li>
                    <li><strong>Live Interaction:</strong> In <strong>Live Website View</strong>, clicking navbar items seamlessly transitions between your project pages!</li>
                  </ul>
                </div>
              </div>

              {/* Step 4: Saving & OneDrive Auto-Sync */}
              <div className="space-y-2 border-l-2 border-indigo-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  Saving Changes to OneDrive Folder
                </h4>
                <p>
                  When you make changes to a page, click the green <strong>Save Page</strong> button in the top bar.
                </p>
                <p className="text-zinc-600">
                  If OneDrive sync is active, your project pages, components, data bindings, and user credentials will automatically update the SQLite database file in your OneDrive project folder.
                </p>
              </div>

              {/* Step 5: Exporting and Running Node.js Server */}
              <div className="space-y-3 border-l-2 border-indigo-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                    5
                  </span>
                  Download and Run Web Bundle on Node.js Server
                </h4>
                <p>
                  Click the <strong>Web Bundle (.zip)</strong> button in the top bar to package all your webpages into a standalone application. You can choose between:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <span className="font-bold text-zinc-800 block">Option A: Static HTML Site</span>
                    <span className="text-[11px] text-zinc-500">
                      Export pre-rendered HTML/CSS/JS files ready for GitHub Pages (<code>github.io</code>), Cloudflare Pages, or static Nginx.
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <span className="font-bold text-zinc-800 block">Option B: Dynamic Node.js Server</span>
                    <span className="text-[11px] text-zinc-500">
                      Full Express server with SQLite database, REST API endpoints (<code>/api/pages</code>, <code>/api/nav</code>), and GraphQL schema.
                    </span>
                  </div>
                </div>

                {/* Shell Command snippet */}
                <div className="bg-zinc-900 text-zinc-200 p-3.5 rounded-xl font-mono text-[11px] space-y-1.5 relative">
                  <div className="text-zinc-400 pb-1 border-b border-zinc-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                      Run downloaded bundle locally:
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard('unzip bundle.zip && cd website-bundle && npm install && npm start', 'node-run')
                      }
                      className="text-indigo-300 hover:text-white text-[10px] flex items-center gap-1"
                    >
                      {copiedCode === 'node-run' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode === 'node-run' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <p className="text-zinc-400"># 1. Extract zip and navigate to directory</p>
                  <p className="text-emerald-400">unzip website-bundle.zip && cd website-bundle</p>
                  <p className="text-zinc-400 mt-1"># 2. Install zero-dependency or lightweight packages</p>
                  <p className="text-emerald-400">npm install</p>
                  <p className="text-zinc-400 mt-1"># 3. Boot local Express server with SQLite</p>
                  <p className="text-emerald-400">npm start</p>
                  <p className="text-indigo-300 text-[10px] pt-1">
                    → Web app will be live at http://localhost:3000 with dynamic SQLite & GraphQL!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* ADMIN MANUAL TAB */}
          {/* ============================================================== */}
          {activeTab === 'admin' && (
            <div className="space-y-8">
              {/* Introduction Hero */}
              <div className="bg-gradient-to-br from-purple-50 via-white to-white p-5 rounded-2xl border border-purple-100 shadow-2xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                  Administrator & Governance Guide
                </span>
                <h3 className="text-base font-bold text-zinc-900 mt-2">
                  Enterprise Platform Administration & Access Governance
                </h3>
                <p className="mt-1 text-zinc-600">
                  This administrative manual covers user account provisioning, cryptographic zero-knowledge password vault management,
                  OneDrive folder structure configuration, project-level RBAC grant access, and release governance.
                </p>
              </div>

              {/* Section 1: Architecture */}
              <div className="space-y-2 border-l-2 border-purple-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    1
                  </span>
                  Hybrid Cloud Architecture Overview
                </h4>
                <p>Canvas Studio implements a secure, separated hybrid architecture:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-indigo-500" />
                      Static Edge Frontend
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-1">
                      Hosted on GitHub Pages (<code>github.io</code>) or CDN. Fast, immutable, and globally distributed.
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                      <Cloud className="w-3.5 h-3.5 text-sky-500" />
                      OneDrive Cloud Storage
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-1">
                      Stores project folders, SQLite databases, and user credentials with Microsoft 365 security.
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <span className="font-bold text-zinc-800 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-500" />
                      GraphQL Dynamic Bridge
                    </span>
                    <span className="text-[11px] text-zinc-500 block mt-1">
                      Provides runtime queries connecting static UI components to live SQLite database records.
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 2: User Provisioning */}
              <div className="space-y-3 border-l-2 border-purple-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    2
                  </span>
                  User Management & Zero-Knowledge Salted SHA-256 Vault
                </h4>
                <p>
                  As an Administrator, you can open the <strong>User Management</strong> screen from the top navigation bar.
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-600 pl-1">
                  <li><strong>Provision Users:</strong> Click <strong>+ Add User</strong>, enter their name, email, role, and password.</li>
                  <li><strong>Cryptographic Salt:</strong> The system automatically runs <code>crypto.getRandomValues(new Uint8Array(16))</code> to generate a cryptographically strong 128-bit salt.</li>
                  <li><strong>Zero-Knowledge Hashing:</strong> The password hash is computed via <code>SHA-256(password + salt)</code> before inserting into the SQLite <code>users</code> table.</li>
                  <li><strong>Role Promotion:</strong> Change any user's role on the fly between <code>Administrator</code>, <code>Website Editor</code>, and <code>Viewer</code>.</li>
                  <li><strong>Reset Passwords:</strong> Admins can trigger secure password resets which recalculate hashes and update the OneDrive SQLite database.</li>
                </ul>
              </div>

              {/* Section 3: Project Grant Access Matrix */}
              <div className="space-y-3 border-l-2 border-purple-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    3
                  </span>
                  Project Grant Access Governance (RBAC)
                </h4>
                <p>
                  To prevent unauthorized edits across multi-tenant website projects, use the <strong>Project Access Matrix</strong>:
                </p>
                <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-2">
                  <div className="font-semibold text-zinc-800">Permissions Hierarchy:</div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-600">
                    <li><strong>Platform Administrator:</strong> Unrestricted access to all projects, user management, and global publishing.</li>
                    <li><strong>Project Owner:</strong> Full edit rights to their created website projects and page navigation menus.</li>
                    <li><strong>Project Editor:</strong> Can edit layout nodes, add sections, and update content in granted projects only.</li>
                    <li><strong>Project Viewer:</strong> Read-only access to view live pages and inspect releases.</li>
                  </ul>
                </div>
              </div>

              {/* Section 4: OneDrive Project Folder Setup */}
              <div className="space-y-2 border-l-2 border-purple-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    4
                  </span>
                  OneDrive Folder Hierarchy & SQLite Database
                </h4>
                <p>Every website project maps to its own folder structure inside OneDrive:</p>
                <div className="bg-zinc-950 text-zinc-200 p-3 rounded-xl font-mono text-[11px] space-y-1">
                  <p className="text-zinc-500">OneDrive Root: /Apps/CanvasStudio/</p>
                  <p className="text-indigo-400">├── db/</p>
                  <p className="text-zinc-400">│   └── canvas_store.sqlite     <span className="text-zinc-500"># Central database with users & global settings</span></p>
                  <p className="text-indigo-400">└── Projects/</p>
                  <p className="text-emerald-400">    ├── apex-cloud-saas/        <span className="text-zinc-500"># Dedicated folder for Apex SaaS project</span></p>
                  <p className="text-emerald-400">    ├── nordic-fintech-labs/    <span className="text-zinc-500"># Dedicated folder for Nordic Labs project</span></p>
                  <p className="text-emerald-400">    └── aura-lifestyle-store/   <span className="text-zinc-500"># Dedicated folder for Aura E-Commerce project</span></p>
                </div>
              </div>

              {/* Section 5: Auditing & Release Management */}
              <div className="space-y-2 border-l-2 border-purple-500 pl-4">
                <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">
                    5
                  </span>
                  Publishing Governance & Immutable Audit Logs
                </h4>
                <p>
                  Every user login, page save, project creation, schema change, and AI modification is immutably recorded
                  in the <strong>Audit Log Viewer</strong>. When publishing pages to production:
                </p>
                <ul className="list-disc list-inside space-y-1 text-zinc-600 pl-1">
                  <li>Changes generate a timestamped semver release tag (e.g. <code>v1.4.0</code>).</li>
                  <li>Instant 1-click rollback is supported via the <strong>Releases</strong> tab.</li>
                  <li>Full layout tree diffs prevent accidental regressions before live customer traffic is affected.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-500">
            Current Manual: <span className="font-semibold text-zinc-800 capitalize">{activeTab} Guide</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            Close Manual
          </button>
        </div>
      </div>
    </div>
  );
};
