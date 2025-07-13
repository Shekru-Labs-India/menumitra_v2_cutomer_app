import { useCallback } from 'react';
import { useToastContext } from './ToastContext.jsx';
import { TOAST_TYPES } from './constants';

export function useToast() {
  const { addToast, removeToast, updateToast, clearToasts } = useToastContext();

  const createToast = useCallback((type, message, options = {}) => {
    const { title, ...rest } = options;
    return addToast({
      type,
      message,
      title,
      ...rest
    });
  }, [addToast]);

  const toast = {
    success: useCallback((message, options) => 
      createToast(TOAST_TYPES.SUCCESS, message, options),
    [createToast]),
    
    error: useCallback((message, options) => 
      createToast(TOAST_TYPES.ERROR, message, options),
    [createToast]),
    
    warning: useCallback((message, options) => 
      createToast(TOAST_TYPES.WARNING, message, options),
    [createToast]),
    
    info: useCallback((message, options) => 
      createToast(TOAST_TYPES.INFO, message, options),
    [createToast]),

    promise: useCallback(async (promise, {
      loading = 'Loading...',
      success = 'Success!',
      error = 'Error occurred'
    } = {}, options = {}) => {
      const toastId = createToast(TOAST_TYPES.INFO, loading, {
        ...options,
        duration: null
      });

      try {
        const result = await promise;
        updateToast(toastId, {
          type: TOAST_TYPES.SUCCESS,
          message: typeof success === 'function' ? success(result) : success,
          duration: options.duration || 3000
        });
        return result;
      } catch (err) {
        updateToast(toastId, {
          type: TOAST_TYPES.ERROR,
          message: typeof error === 'function' ? error(err) : error,
          duration: options.duration || 3000
        });
        throw err;
      }
    }, [createToast, updateToast]),

    dismiss: useCallback((id) => {
      if (id) {
        removeToast(id);
      }
    }, [removeToast]),

    clearAll: clearToasts
  };

  return toast;
} 