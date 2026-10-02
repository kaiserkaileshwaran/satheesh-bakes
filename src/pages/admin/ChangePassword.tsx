import React, { useState } from 'react';
import { Eye, EyeOff, Key, Mail, User } from 'lucide-react';
import { useNotification } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

export const ChangePassword: React.FC = () => {
  const { showToast } = useNotification();
  const { user, updateAccount } = useAuth();
  
  const [email, setEmail] = useState(() => user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="p-6 bg-white dark:bg-bakery-chocolate rounded-3xl shadow-warm">
        <h2 className="font-bold text-lg">Account Settings</h2>
        <p className="mt-3 text-sm">You must be signed in to access account settings.</p>
      </div>
    );
  }

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd) return 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0-4
  };

  const strengthLabel = (s: number) => {
    switch (s) {
      case 0: return 'Too short';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Strong';
      case 4: return 'Very Strong';
      default: return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!currentPassword) {
      showToast('Validation Error', 'Please enter your current password.', 'error');
      return;
    }

    if (!email) {
      showToast('Validation Error', 'Email address cannot be empty.', 'error');
      return;
    }

    if (newPassword && newPassword.length < 8) {
      showToast('Validation Error', 'New password must be at least 8 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Validation Error', 'New password and confirmation do not match.', 'error');
      return;
    }

    // Determine what we're updating
    const isEmailChanged = email.toLowerCase() !== user.email.toLowerCase();
    const isPasswordChanged = !!newPassword;

    if (!isEmailChanged && !isPasswordChanged) {
      showToast('Info', 'No changes detected to update.', 'info');
      return;
    }

    setLoading(true);

    try {
      await updateAccount(currentPassword, isEmailChanged ? email : undefined, isPasswordChanged ? newPassword : undefined);
      
      showToast('Success', 'Account updated successfully. You are still signed in.', 'success');
      
      // Clear password fields after success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while updating the account.';
      console.error('Account update error', err);
      showToast('Error', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-bakery-chocolate rounded-3xl p-6 shadow-warm">
        <h2 className="font-bold text-lg text-bakery-chocolate dark:text-bakery-cream flex items-center gap-2"><User className="w-5 h-5" /> Account Settings</h2>
        <p className="text-sm text-bakery-chocolate/70 dark:text-bakery-cream/70 mt-2">Update your administrator email and password. You will remain signed in if reauthentication succeeds.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold">Email Address</label>
            <div className="relative mt-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold"
              />
              <Mail className="absolute left-3 top-2 w-4 h-4 text-bakery-chocolate/60" />
            </div>
          </div>

          <div className="border-t border-bakery-beige/50 pt-4 mt-4">
            <h3 className="text-sm font-bold text-bakery-chocolate dark:text-bakery-cream mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold">Current Password <span className="text-rose-500">*</span></label>
                <div className="relative mt-1">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Required for any account changes"
                    className="w-full pl-10 pr-10 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold"
                    required
                  />
                  <Key className="absolute left-3 top-2 w-4 h-4 text-bakery-chocolate/60" />
                  <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-2 top-2 text-bakery-chocolate/60">
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">New Password <span className="text-bakery-chocolate/50 font-normal">(Leave blank to keep current)</span></label>
                <div className="relative mt-1">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold"
                  />
                  <Key className="absolute left-3 top-2 w-4 h-4 text-bakery-chocolate/60" />
                  <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-2 top-2 text-bakery-chocolate/60">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className={`w-24 h-2 rounded-full bg-bakery-beige/40 overflow-hidden`}>
                      <div style={{ width: `${(passwordStrength(newPassword) / 4) * 100}%` }} className={`h-full bg-${passwordStrength(newPassword) >= 3 ? 'emerald-500' : 'amber-400'}`} />
                    </div>
                    <span className="text-xs text-bakery-chocolate/70">{strengthLabel(passwordStrength(newPassword))}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold">Confirm New Password</label>
                <div className="relative mt-1">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-xl bg-bakery-beige/30 dark:bg-gray-800 border border-bakery-beige text-xs outline-none focus:ring-2 focus:ring-bakery-gold"
                  />
                  <Key className="absolute left-3 top-2 w-4 h-4 text-bakery-chocolate/60" />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-2 top-2 text-bakery-chocolate/60">
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => { setEmail(user?.email || ''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} className="flex-1 py-2.5 rounded-xl border border-bakery-beige text-xs font-bold hover:bg-bakery-beige/50 transition-colors">Reset</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-bakery-brown text-bakery-cream text-xs font-bold hover:bg-bakery-brown-dark transition-colors">{loading ? 'Updating…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
