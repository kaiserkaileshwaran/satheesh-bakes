import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

const getStrength = (pwd: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const levels = [
    { label: 'Very Weak', color: 'bg-rose-500' },
    { label: 'Weak', color: 'bg-orange-400' },
    { label: 'Fair', color: 'bg-yellow-400' },
    { label: 'Strong', color: 'bg-lime-500' },
    { label: 'Very Strong', color: 'bg-emerald-500' },
  ];
  return { score, ...levels[score] };
};

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle } = useAuth();
  const { showToast } = useNotification();

  const [form, setForm] = useState({ displayName: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getStrength(form.password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      showToast('Passwords do not match', 'Please re-enter your password.', 'error');
      return;
    }
    if (strength.score < 2) {
      showToast('Weak Password', 'Please choose a stronger password (min 8 chars, uppercase, number).', 'warning');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.displayName);
      showToast('Account Created!', 'Welcome to Satheesh Bakery!', 'success');
      navigate('/profile');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Try a different email.';
      showToast('Registration Failed', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bakery-beige/30 dark:bg-bakery-chocolate/50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-bakery-brown flex items-center justify-center text-3xl">🍰</div>
          <h1 className="font-serif font-bold text-3xl text-bakery-chocolate dark:text-bakery-cream">Create Account</h1>
          <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70">Join Satheesh Bakery and start your premium bakery experience</p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-warm space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-bakery-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="text" required value={form.displayName} onChange={e => setForm(f => ({...f, displayName: e.target.value}))}
                  placeholder="Your name" className="w-full pl-10 pr-4 py-3 rounded-xl bg-bakery-beige/30 dark:bg-bakery-brown/20 border border-bakery-beige text-bakery-chocolate dark:text-bakery-cream text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-bakery-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="email" required value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                  placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 rounded-xl bg-bakery-beige/30 dark:bg-bakery-brown/20 border border-bakery-beige text-bakery-chocolate dark:text-bakery-cream text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-bakery-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))}
                  placeholder="Min 8 chars, 1 uppercase, 1 number" className="w-full pl-10 pr-10 py-3 rounded-xl bg-bakery-beige/30 dark:bg-bakery-brown/20 border border-bakery-beige text-bakery-chocolate dark:text-bakery-cream text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-bakery-brown/50">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`flex-1 h-1.5 rounded-full transition-all ${i < strength.score ? strength.color : 'bg-bakery-beige'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-bakery-chocolate/60 dark:text-bakery-cream/60">{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-bakery-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="password" required value={form.confirm} onChange={e => setForm(f => ({...f, confirm: e.target.value}))}
                  placeholder="Re-enter password" className="w-full pl-10 pr-4 py-3 rounded-xl bg-bakery-beige/30 dark:bg-bakery-brown/20 border border-bakery-beige text-bakery-chocolate dark:text-bakery-cream text-xs outline-none focus:ring-2 focus:ring-bakery-gold" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-sm hover:bg-bakery-brown-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              Create My Account
            </button>
          </form>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                await signInWithGoogle();
                showToast('Signed in with Google', 'Welcome back to Satheesh Bakery!', 'success');
                navigate('/profile');
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Please try again.';
                showToast('Google Sign-In Failed', message, 'error');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full py-3 rounded-xl border border-bakery-beige bg-white text-bakery-chocolate font-bold text-sm hover:bg-bakery-beige transition-colors flex items-center justify-center gap-2"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-4 h-4" />
            Continue with Google
          </button>

          <p className="text-center text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-bakery-brown dark:text-bakery-gold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
