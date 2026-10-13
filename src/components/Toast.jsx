import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  return (
    <div
      aria-live="polite"
      className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none no-print"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md ${
                isError
                  ? 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                  : isInfo
                  ? 'bg-sky-50/95 dark:bg-sky-950/90 border-sky-200 dark:border-sky-900/60 text-sky-900 dark:text-sky-200'
                  : 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isError ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                ) : isInfo ? (
                  <Info className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="flex-1 text-sm font-medium leading-snug">
                {toast.message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-md cursor-pointer"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
