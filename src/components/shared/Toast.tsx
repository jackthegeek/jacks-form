import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

let addToastFn: ((type: ToastType, message: string) => void) | null = null;

export function toast(type: ToastType, message: string) {
  addToastFn?.(type, message);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    setToasts(t => [...t, { id, type, message }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium min-w-[280px] max-w-sm animate-slide-up ${
            t.type === 'success' ? 'bg-emerald-600 text-white' :
            t.type === 'error' ? 'bg-red-600 text-white' :
            'bg-gray-800 text-white'
          }`}
        >
          {t.type === 'success' && <CheckCircle size={16} />}
          {t.type === 'error' && <XCircle size={16} />}
          {t.type === 'info' && <AlertCircle size={16} />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
