import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const TOAST_STYLES: Record<ToastType, { bg: string; border: string; text: string; iconColor: string }> = {
  success: {
    bg: 'bg-[#0f1d16]/95',
    border: 'border-emerald-500/30',
    text: 'text-emerald-100',
    iconColor: 'text-emerald-400',
  },
  error: {
    bg: 'bg-[#220f14]/95',
    border: 'border-rose-500/30',
    text: 'text-rose-100',
    iconColor: 'text-rose-400',
  },
  info: {
    bg: 'bg-[#0f172a]/95',
    border: 'border-blue-500/30',
    text: 'text-blue-100',
    iconColor: 'text-blue-400',
  },
  warning: {
    bg: 'bg-[#221708]/95',
    border: 'border-amber-500/30',
    text: 'text-amber-100',
    iconColor: 'text-amber-400',
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3200) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, duration?: number) => showToast(message, 'success', duration), [showToast]);
  const error = useCallback((message: string, duration?: number) => showToast(message, 'error', duration), [showToast]);
  const info = useCallback((message: string, duration?: number) => showToast(message, 'info', duration), [showToast]);
  const warning = useCallback((message: string, duration?: number) => showToast(message, 'warning', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      {/* Floating Toast Notification Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4"
      >
        {toasts.map(t => {
          const Icon = TOAST_ICONS[t.type];
          const style = TOAST_STYLES[t.type];
          return (
            <div
              key={t.id}
              role="alert"
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-200 animate-slide-up w-full ${style.bg} ${style.border}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${style.iconColor}`} />
                <span className={`text-xs font-semibold truncate ${style.text}`}>
                  {t.message}
                </span>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
