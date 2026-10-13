import React, { useState } from 'react';
import { X, Lock, KeyRound, Eye, EyeOff, ShieldCheck, Check } from 'lucide-react';
import { vaultService } from '../services/vault';

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actionTitle?: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  actionTitle = 'Upload or Write in Memory Gallery',
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vaultService.unlock(password)) {
      setError(false);
      setPassword('');
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass !== vaultService.getPassword()) {
      setError(true);
      return;
    }
    if (!newPass.trim()) return;

    vaultService.setPassword(newPass.trim());
    vaultService.unlock(newPass.trim());
    setChangeSuccess(true);
    setTimeout(() => {
      setChangeSuccess(false);
      setIsChangingPass(false);
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-stone-400 hover:text-stone-100 rounded-xl hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold text-stone-100 tracking-tight">
            {isChangingPass ? 'Update Gallery Password' : 'Owner Password Required'}
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-xs leading-relaxed">
            {isChangingPass
              ? 'Enter your current password and choose a new master key.'
              : `To ${actionTitle.toLowerCase()}, please enter your gallery security password.`}
          </p>
        </div>

        {!isChangingPass ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Enter vault password"
                  className={`w-full px-4 py-3 bg-stone-950 border rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none transition-all text-sm pr-11 ${
                    error
                      ? 'border-rose-500/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-stone-800 focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5 animate-in fade-in">
                  <span>Incorrect password. Please try again.</span>
                </p>
              )}
            </div>

            <div className="p-3 bg-stone-950/60 rounded-xl border border-stone-800/80 text-xs text-stone-400 flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-stone-300 font-medium">Default password: </span>
                <span className="font-mono text-amber-300 font-semibold selection:bg-amber-500/30">
                  memory123
                </span>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  You can change this password at any time.
                </p>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 text-sm font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Unlock & Proceed</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsChangingPass(true)}
                className="text-xs text-stone-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
              >
                Change vault password
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Current password"
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="New password"
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/70 text-sm"
              />
            </div>

            {changeSuccess && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Password successfully updated!</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsChangingPass(false)}
                className="flex-1 py-2.5 text-xs font-medium text-stone-400 hover:text-stone-200 bg-stone-950 rounded-xl border border-stone-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md"
              >
                Save New Key
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
