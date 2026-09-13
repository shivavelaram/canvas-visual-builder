import React, { useState } from 'react';
import { AuthUser, StoredUserCredential, Website } from '../../types/canvas';
import {
  Sparkles,
  Shield,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Lock,
  Globe,
  Database,
  Cloud,
  Layers,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  FolderLock,
  KeyRound,
  Download,
  Menu as MenuIcon,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';

interface MainHomePageProps {
  currentUser: AuthUser | null;
  storedUsers: StoredUserCredential[];
  websites: Website[];
  onLogin: (email: string, password?: string) => Promise<void>;
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'editor' | 'viewer';
  }) => Promise<void>;
  onEnterStudio: () => void;
  onOpenUserManagement: () => void;
  onOpenManual: (role: 'admin' | 'user') => void;
  onSelectWebsite: (siteId: string) => void;
  onLogout?: () => void;
}

export const MainHomePage: React.FC<MainHomePageProps> = ({
  currentUser,
  storedUsers,
  websites,
  onLogin,
  onRegister,
  onEnterStudio,
  onOpenUserManagement,
  onOpenManual,
  onSelectWebsite,
  onLogout,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Quick preset login helper
  const handleQuickLogin = async (userEmail: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await onLogin(userEmail);
      onEnterStudio();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        if (!email.trim()) {
          setError('Please enter your email ID');
          setIsLoading(false);
          return;
        }
        await onLogin(email.trim(), password);
        onEnterStudio();
      } else {
        if (!name.trim() || !email.trim() || !password) {
          setError('All registration fields are required');
          setIsLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long');
          setIsLoading(false);
          return;
        }
        await onRegister({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
        });
        onEnterStudio();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-zinc-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 4, label: 'Very Strong', color: 'bg-emerald-600' };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-zinc-200 px-6 h-16 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-zinc-900 flex items-center gap-2">
              <span>Canvas Studio</span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold border border-indigo-200">
                Visual Website Platform
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Multi-Project Website Development & OneDrive SQLite Vault
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Documentation Manuals Buttons */}
          <button
            onClick={() => onOpenManual('user')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-indigo-50 hover:border-indigo-200 text-zinc-700 hover:text-indigo-700 text-xs font-semibold transition-all shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">User Manual</span>
          </button>

          <button
            onClick={() => onOpenManual('admin')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 hover:bg-purple-50 hover:border-purple-200 text-zinc-700 hover:text-purple-700 text-xs font-semibold transition-all shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Admin Manual</span>
          </button>

          {/* User Management Button (if Admin) */}
          {currentUser && currentUser.role === 'admin' && (
            <button
              onClick={onOpenUserManagement}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition-all shadow-2xs"
            >
              <FolderLock className="w-3.5 h-3.5" />
              <span>User Admin Console</span>
            </button>
          )}

          {/* User Session or Sign In Prompt */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-zinc-200">
              <div className="flex items-center space-x-2 bg-zinc-100 px-2.5 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold leading-none text-zinc-900">{currentUser.name}</div>
                  <div className="text-[10px] text-zinc-500 capitalize">{currentUser.role}</div>
                </div>
              </div>

              <button
                onClick={onEnterStudio}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/25 transition-all"
              >
                <span>Open Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Sign In Required</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero & Auth Portal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 flex flex-col justify-center space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Platform Presentation */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Enterprise Visual Builder & Multi-Page Generator</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight">
              Create and link multiple websites with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                OneDrive SQLite & Node.js
              </span>
            </h1>

            <p className="text-base text-zinc-600 leading-relaxed max-w-2xl">
              Go beyond single templates. Build full websites under Canvas Studio (E-Commerce, Portfolios, SaaS, Corporate),
              interconnect all pages with responsive navigation menus, synchronize SQLite databases into dedicated OneDrive
              project folders with user grant access, and download run-anywhere Node.js server packages.
            </p>

            {/* Core Capability Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-2xs hover:border-indigo-200 transition-all">
                <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs mb-1">
                  <Globe className="w-4 h-4" />
                  <span>Multi-Website Projects</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Build SaaS, E-Commerce, Portfolios, or Documentation with dedicated OneDrive folders per project.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-2xs hover:border-indigo-200 transition-all">
                <div className="flex items-center space-x-2 text-purple-600 font-bold text-xs mb-1">
                  <MenuIcon className="w-4 h-4" />
                  <span>Page Menu Linker</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Easily link multiple pages with synchronized top navigation menus across your whole site.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-2xs hover:border-indigo-200 transition-all">
                <div className="flex items-center space-x-2 text-sky-600 font-bold text-xs mb-1">
                  <Cloud className="w-4 h-4" />
                  <span>OneDrive SQLite Storage</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Store layout trees, zero-knowledge salted passwords, and dynamic data securely in OneDrive.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-2xs hover:border-indigo-200 transition-all">
                <div className="flex items-center space-x-2 text-emerald-600 font-bold text-xs mb-1">
                  <Download className="w-4 h-4" />
                  <span>Node.js Server Bundle</span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Download package and run as a static site or dynamic Express + SQLite + GraphQL server.
                </p>
              </div>
            </div>

            {/* Cryptographic Security Assurance Banner */}
            <div className="bg-indigo-50/80 p-4 rounded-2xl border border-indigo-100 flex items-start space-x-3 text-xs text-indigo-900">
              <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-indigo-950">Zero-Knowledge Account Security</div>
                <p className="text-[11px] text-indigo-800 leading-relaxed">
                  Sign in with your registered administrator or developer credentials. Passwords are salted with a 128-bit
                  CSPRNG salt and SHA-256 hashed before synchronizing to your OneDrive SQLite database (`canvas_store.sqlite`).
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication & Registration Card */}
          <div className="lg:col-span-5">
            {currentUser ? (
              /* Already Signed In Card */
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl p-6 sm:p-8 space-y-6">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md shadow-indigo-500/25">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{currentUser.name}</h3>
                    <p className="text-xs text-zinc-500">{currentUser.email}</p>
                  </div>
                  <div className="inline-block">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        currentUser.role === 'admin'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {currentUser.role === 'admin' ? 'Platform Administrator' : `${currentUser.role} Account`}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2 text-xs text-zinc-600">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Access Level:</span>
                    <span className="font-bold text-zinc-800">
                      {currentUser.role === 'admin' ? 'All Websites & User Governance' : 'Granted Projects'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Active Websites:</span>
                    <span className="font-mono text-zinc-800 font-semibold">{websites.length} Available</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={onEnterStudio}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open Canvas Visual Studio</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={onOpenUserManagement}
                      className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FolderLock className="w-4 h-4" />
                      <span>Manage Users & Roles (Admin Console)</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="w-full py-2.5 bg-zinc-100 hover:bg-rose-50 hover:text-rose-700 border border-zinc-200 text-zinc-700 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out & Switch Account</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-xl p-6 sm:p-8 space-y-6">
              {/* Card Header with Tabs */}
              <div>
                <div className="flex items-center bg-zinc-100 p-1 rounded-xl mb-4 text-xs font-semibold">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setError(null);
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      authMode === 'login'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setError(null);
                    }}
                    className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      authMode === 'register'
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register Account</span>
                  </button>
                </div>

                <h2 className="text-xl font-bold text-zinc-900">
                  {authMode === 'login' ? 'Sign in with your Email ID' : 'Create New User Account'}
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  {authMode === 'login'
                    ? 'Enter your credentials to access granted website projects in Canvas Studio'
                    : 'Your password will be encrypted with a unique salt and SHA-256 in OneDrive'}
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {authMode === 'register' && (
                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Lin"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="font-semibold text-zinc-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-zinc-700">Password</label>
                    {authMode === 'login' && (
                      <span className="text-[11px] text-indigo-600 cursor-pointer hover:underline">
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter secure password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Password strength meter for registration */}
                  {authMode === 'register' && password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-zinc-500 font-medium">
                        <span>Password Strength:</span>
                        <span className="font-bold">{strength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full flex-1 rounded-full transition-all ${
                              step <= strength.score ? strength.color : 'bg-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {authMode === 'register' && (
                  <div>
                    <label className="font-semibold text-zinc-700 block mb-1">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-xs font-medium"
                    >
                      <option value="editor">Website Developer / Editor (Builds & edits pages)</option>
                      <option value="admin">Platform Administrator (Full user & project governance)</option>
                      <option value="viewer">Stakeholder Viewer (Read-only live website view)</option>
                    </select>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <span>Verifying & Syncing...</span>
                    ) : authMode === 'login' ? (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In to Canvas Studio</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Register & Generate Salted Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Zero-Knowledge Security Notice */}
              <div className="pt-2 border-t border-zinc-100 flex items-start space-x-2 text-[11px] text-zinc-400">
                <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>
                  Zero-Knowledge Security: Passwords are salted with 128-bit CSPRNG and hashed with SHA-256 before
                  syncing to your OneDrive SQLite database.
                </span>
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Multi-Website Projects Showcase */}
        <div className="pt-6 border-t border-zinc-200 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-zinc-900">
                Active Website Development Projects in Canvas Studio
              </h3>
              <p className="text-xs text-zinc-500">
                Each project maintains its own dedicated OneDrive folder, interconnected pages, and user grant access
              </p>
            </div>
            {currentUser && (
              <button
                onClick={onEnterStudio}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View in Visual Builder</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {websites.map((site) => (
              <div
                key={site.id}
                onClick={() => {
                  if (!currentUser) {
                    setError('Please sign in or register above to open and edit website projects.');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                  }
                  onSelectWebsite(site.id);
                  onEnterStudio();
                }}
                className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">
                    {site.category}
                  </span>
                  <span className="text-xs font-mono text-zinc-400">{site.pages.length} Pages</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-zinc-900 group-hover:text-indigo-600 transition-colors">
                    {site.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{site.description}</p>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span className="truncate max-w-[180px]">{site.oneDriveFolder || `/Apps/${site.id}/`}</span>
                  <span className="text-indigo-600 font-semibold group-hover:underline">
                    {currentUser ? 'Open →' : 'Sign in to open'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
