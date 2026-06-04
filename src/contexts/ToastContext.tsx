import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { AlertProps } from '@mui/material';
import { Toast } from '../components/common/Toast';

export type ToastSeverity = NonNullable<AlertProps['severity']>;

interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

export interface ToastContextValue {
  showToast: (message: string, severity?: ToastSeverity) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const close = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const showToast = useCallback((message: string, severity: ToastSeverity = 'info') => {
    setToast({ open: true, message, severity });
  }, []);

  const showSuccess = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const showError = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const showWarning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const showInfo = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  const value = useMemo(
    () => ({ showToast, showSuccess, showError, showWarning, showInfo }),
    [showToast, showSuccess, showError, showWarning, showInfo]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={close} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
