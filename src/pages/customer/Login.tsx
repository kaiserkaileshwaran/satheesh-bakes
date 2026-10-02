import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      showToast('Welcome Back!', 'You\'re now signed in.', 'success');
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      showToast('Login Failed', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-bakery-beige/30 dark:bg-bakery-chocolate/50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-bakery-brown flex items-center justify-center text-3xl">🍞</div>
          <h1 className="font-serif font-bold text-3xl text-bakery-chocolate dark:text-bakery-cream">Welcome Back</h1>
          <p className="text-xs text-bakery-chocolate/70 dark:text-bakery-cream/70">Sign in to your Satheesh Bakery account</p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-bakery-chocolate border border-bakery-beige shadow-warm space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-bakery-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-bakery-beige/30 dark:bg-bakery-brown/20 border border-bakery-beige text-bakery-chocolate dark:text-bakery-cream text-xs outline-none focus:ring-2 focus:ring-bakery-gold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-bakery-chocolate/70 dark:text-bakery-cream/70 mb-1 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-bakery-brown/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-bakery-beige/30 dark:bg-bakery-brown/20 border border-bakery-beige text-bakery-chocolate dark:text-bakery-cream text-xs outline-none focus:ring-2 focus:ring-bakery-gold"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-bakery-brown/50 hover:text-bakery-brown">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-bakery-brown text-bakery-cream font-bold text-sm hover:bg-bakery-brown-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              Sign In
            </button>
          </form>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                await signInWithGoogle();
                showToast('Signed in with Google', 'Welcome back to Satheesh Bakery!', 'success');
                navigate('/');
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

        </div>
      </div>
    </div>
  );
};
