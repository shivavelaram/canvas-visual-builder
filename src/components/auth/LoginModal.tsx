import React, { useState } from 'react';
import { AuthUser } from '../../types/canvas';
import { ShieldCheck, User, LogIn, LogOut, CheckCircle2, KeyRound, Sparkles, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser: AuthUser | null;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
  onLogout: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLogin,
  onLogout,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>('admin');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide a valid email address');
      return;
    }
    const name = email.split('@')[0] || 'User';
    onLogin({
      id: `user-${Date.now()}`,
      email,
      name: name.charAt(0).toUpperCase() + name.slice(1),
      role,
      avatarUrl: undefined,
      token: `token-${Date.now()}`,
    });
    onClose();
  };

  const handleQuickLogin = (asAdmin: boolean) => {
    if (asAdmin) {
      onLogin({
        id: 'user-admin-1',
        email: 'admin@apexcloud.io',
        name: 'System Administrator',
        role: 'admin',
        token: 'jwt-admin-elevated-token',
      });
    } else {
      onLogin({
        id: 'user-builder-2',
        email: 'builder@apexcloud.io',
        name: 'Alex Vance (Builder)',
        role: 'editor',
        token: 'jwt-editor-token',
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-zinc-200 overflow-hidden text-zinc-900">
        {/* Header */}
        <div className="p-5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Account & Security Access</h3>
              <p className="text-xs text-zinc-500">Sign in to manage websites, OneDrive, & GraphQL</p>
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
        <div className="p-6 space-y-6">
          {currentUser ? (
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.name.charAt(0)}
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

              <div className="text-xs text-zinc-600 pt-2 border-t border-zinc-200 flex items-center justify-between">
                <span>Active Session: Verified</span>
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
            <>
              {/* Quick Login Presets */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Quick Access Profiles
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(true)}
                    className="p-3 text-left rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100/60 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-indigo-950">Admin Sign In</span>
                      <ShieldCheck className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[11px] text-zinc-500">Unlocks OneDrive & SQLite one-time connection setup.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin(false)}
                    className="p-3 text-left rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-zinc-900">Builder Sign In</span>
                      <User className="w-4 h-4 text-zinc-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-[11px] text-zinc-500">Visual canvas editing, pages creation & publishing.</p>
                  </button>
                </div>
              </div>

              {/* Or manual form */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-zinc-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 absolute">
                  Or Custom Account
                </span>
              </div>

              <form onSubmit={handleCustomSubmit} className="space-y-3">
                {error && <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">{error}</p>}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-zinc-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">Assigned Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        role === 'admin'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      Admin Privileges
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('editor')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                        role === 'editor'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      Builder / Editor
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Canvas Studio</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
