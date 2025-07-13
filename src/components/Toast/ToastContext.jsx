import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import { DEFAULT_TOAST_CONFIG } from './constants';

const ToastContext = createContext(null);

// Action Types
const ACTIONS = {
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  CLEAR_TOASTS: 'CLEAR_TOASTS'
};

// Define reducer outside as a regular function
const toastReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_TOAST: {
      const { limit } = action.config;
      const newToasts = [...state];
      
      if (limit && newToasts.length >= limit) {
        newToasts.splice(0, newToasts.length - limit + 1);
      }
      
      return [...newToasts, action.toast];
    }
    
    case ACTIONS.REMOVE_TOAST:
      return state.filter(toast => toast.id !== action.id);
      
    case ACTIONS.UPDATE_TOAST:
      return state.map(toast => 
        toast.id === action.id ? { ...toast, ...action.updates } : toast
      );
      
    case ACTIONS.CLEAR_TOASTS:
      return [];
      
    default:
      return state;
  }
};

export function ToastProvider({ children, config = {} }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);
  
  const toastConfig = useMemo(() => ({
    ...DEFAULT_TOAST_CONFIG,
    ...config
  }), [config]);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    dispatch({
      type: ACTIONS.ADD_TOAST,
      toast: {
        id,
        createdAt: Date.now(),
        ...toast
      },
      config: toastConfig
    });
    return id;
  }, [toastConfig]);

  const removeToast = useCallback((id) => {
    dispatch({ type: ACTIONS.REMOVE_TOAST, id });
  }, []);

  const updateToast = useCallback((id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_TOAST, id, updates });
  }, []);

  const clearToasts = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_TOASTS });
  }, []);

  const value = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    updateToast,
    clearToasts,
    config: toastConfig
  }), [toasts, addToast, removeToast, updateToast, clearToasts, toastConfig]);

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
} 