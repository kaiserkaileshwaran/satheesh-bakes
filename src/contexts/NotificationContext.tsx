import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface NotificationContextType {
  showToast: (title: string, message?: string, type?: ToastMessage['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/** Pure utility — lives at module scope, not inside component body */
function generateToastId(): string {
  return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (title: string, message?: string, type: ToastMessage['type'] = 'success') => {
    const id = generateToastId();
    const newToast: ToastMessage = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`pointer-events-auto p-4 rounded-2xl shadow-warm-lg border flex items-start gap-3 glass-card ${
                toast.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-50/90 text-emerald-950 dark:bg-emerald-950/90 dark:text-emerald-100'
                  : toast.type === 'error'
                  ? 'border-rose-500/30 bg-rose-50/90 text-rose-950 dark:bg-rose-950/90 dark:text-rose-100'
                  : toast.type === 'warning'
                  ? 'border-amber-500/30 bg-amber-50/90 text-amber-950 dark:bg-amber-950/90 dark:text-amber-100'
                  : 'border-bakery-brown/30 bg-bakery-cream text-bakery-chocolate'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
                {toast.type === 'warning' && <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-bakery-brown dark:text-bakery-gold" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm leading-snug">{toast.title}</h4>
                {toast.message && <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used within a NotificationProvider');
  return ctx;
};
