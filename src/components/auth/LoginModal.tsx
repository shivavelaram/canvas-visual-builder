import React, { useState } from 'react';
import { AuthUser, StoredUserCredential } from '../../types/canvas';
import {
  ShieldCheck,
  User,
  LogIn,
  LogOut,
  CheckCircle2,
  KeyRound,
  Sparkles,
  X,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  Cloud,
  Check,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  onClose: () => void;
  onLogin: (email: string, password?: string) => Promise<void> | void;
  onRegister: (data: {
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'editor';
  }) => Promise<void> | void;
  onLogout: () => void;
  storedUsers?: StoredUserCredential[];
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLogin,
  onRegister,
  onLogout,
  storedUsers = [],
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regRole, setRegRole] = useState<'admin' | 'editor'>('admin');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  if (!isOpen) return null;

  // Calculate password strength
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-indigo-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(regPassword);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail) {
      setLoginError('Please enter an email address');
      return;
    }

    try {
      setIsSubmitting(true);
      await onLogin(loginEmail, loginPassword);
      onClose();
    } catch (err: any) {
      setLoginError(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    if (!regName.trim()) {
      setRegError('Please provide your full name');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegError('Please enter a valid email address');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters long');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      await onRegister({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      });
      setRegSuccess('Account created! Salted password hashed & saved to OneDrive SQLite vault.');
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setRegError(err?.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (asAdmin: boolean) => {
    try {
      setIsSubmitting(true);
      if (asAdmin) {
        await onLogin('admin@apexcloud.io', 'Admin@Secure2026');
      } else {
        await onLogin('builder@apexcloud.io', 'Builder@2026');
      }
      onClose();
    } catch (err: any) {
      setLoginError(err?.message || 'Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 overflow-hidden text-zinc-900 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Canvas Studio Authentication</h3>
              <p className="text-xs text-zinc-500">Secure OneDrive SQLite Vault Authentication</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {currentUser ? (
            /* Logged in state */
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{currentUser.name}</h4>
                    <p className="text-xs text-zinc-500">{currentUser.email}</p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {currentUser.role}
                </span>
              </div>

              {/* Security info banner */}
              <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-start space-x-2">
                <Cloud className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">OneDrive Vault Synchronized</span>
                  <span className="text-[11px] text-emerald-800">
                    Your password credential is stored cryptographically hashed (SHA-256 with 128-bit salt) in your OneDrive SQLite file (`canvas_store.sqlite`).
                  </span>
                </div>
              </div>

              <div className="text-xs text-zinc-600 pt-2 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-400 font-mono">Token: active</span>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex items-center space-x-1.5 text-rose-600 hover:text-rose-800 font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Navigation Tabs: Login vs Register */
            <>
              <div className="flex p-1 bg-zinc-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLoginError('');
                    setRegError('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'login'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setLoginError('');
                    setRegError('');
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                    activeTab === 'register'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register Account</span>
                </button>
              </div>

              {/* TAB 1: SIGN IN */}
              {activeTab === 'login' && (
                <div className="space-y-4">
                  {/* Manual Login Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    {loginError && (
                      <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                        {loginError}
                      </p>
                    )}

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="admin@apexcloud.io"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-zinc-700">Password</label>
                        <span className="text-[10px] text-zinc-400">Salted SHA-256 Vault</span>
                      </div>
                      <div className="relative">
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>{isSubmitting ? 'Verifying...' : 'Sign In to Canvas Studio'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: REGISTER NEW ACCOUNT */}
              {activeTab === 'register' && (
                <div className="space-y-4">
                  {/* Security Vault Banner */}
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 space-y-1.5">
                    <div className="flex items-center space-x-1.5 font-bold text-sky-900">
                      <Lock className="w-4 h-4 text-sky-600" />
                      <span>Secure OneDrive Password Storage</span>
                    </div>
                    <p className="text-[11px] text-sky-900/80 leading-relaxed">
                      Your password will be cryptographically salted with a random 128-bit key and hashed using <strong>SHA-256</strong>. The hashed credentials record is stored directly in your OneDrive SQLite file (<code>canvas_store.sqlite</code>). Plaintext passwords are never saved.
                    </p>
                  </div>

                  {regError && (
                    <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl">
                      {regError}
                    </p>
                  )}

                  {regSuccess && (
                    <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{regSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g., Sarah Connor"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="sarah@company.com"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Password</label>
                      <div className="relative">
                        <input
                          type={showRegPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900 pr-9"
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                        >
                          {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Password strength bar */}
                      {regPassword && (
                        <div className="mt-1.5 space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-zinc-500">Security Strength:</span>
                            <span className="font-semibold text-zinc-700">{strength.label}</span>
                          </div>
                          <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-1">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={`h-full flex-1 rounded-full ${
                                  step <= strength.score ? strength.color : 'bg-zinc-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Confirm Password</label>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700 block mb-1">Role Privileges</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole('admin')}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            regRole === 'admin'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500/30'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>Admin</span>
                            {regRole === 'admin' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Full control + OneDrive bridge</p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('editor')}
                          className={`p-2.5 rounded-xl text-left border transition-all ${
                            regRole === 'editor'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500/30'
                              : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                          }`}
                        >
                          <div className="font-bold text-xs flex items-center justify-between">
                            <span>Builder</span>
                            {regRole === 'editor' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-0.5">Page editing & exports</p>
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isSubmitting ? 'Registering & Syncing...' : 'Create Account & Sync to OneDrive'}</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

