import React, { createContext, useContext } from 'react';
import toast, { Toast } from 'react-hot-toast';

interface NotificationContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  loading: (message: string) => string;
  dismiss: (id?: string) => void;
  promise: <T>(
    promise: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) => Promise<T>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const success = (message: string) => {
    toast.success(message, {
      style: {
        background: '#1e293b',
        color: '#f8fafc',
        border: '1px solid rgba(16, 185, 129, 0.2)',
      },
      iconTheme: {
        primary: '#10b981',
        secondary: '#f8fafc',
      },
    });
  };

  const error = (message: string) => {
    toast.error(message, {
      style: {
        background: '#1e293b',
        color: '#f8fafc',
        border: '1px solid rgba(239, 68, 68, 0.2)',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: '#f8fafc',
      },
    });
  };

  const info = (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      style: {
        background: '#1e293b',
        color: '#f8fafc',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      },
    });
  };

  const loading = (message: string): string => {
    return toast.loading(message, {
      style: {
        background: '#1e293b',
        color: '#f8fafc',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    });
  };

  const dismiss = (id?: string) => {
    toast.dismiss(id);
  };

  const promise = <T,>(
    promiseInstance: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ): Promise<T> => {
    return toast.promise(
      promiseInstance,
      {
        loading: msgs.loading,
        success: msgs.success,
        error: msgs.error,
      },
      {
        style: {
          background: '#1e293b',
          color: '#f8fafc',
        },
      }
    );
  };

  return (
    <NotificationContext.Provider value={{ success, error, info, loading, dismiss, promise }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
export default useNotification;
