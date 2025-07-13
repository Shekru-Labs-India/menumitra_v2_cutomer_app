import { memo } from 'react';
import { createPortal } from 'react-dom';
import { useToastContext } from './ToastContext';
import Toast from './Toast';
import './ToastContainer.css';

const ToastContainer = memo(function ToastContainer() {
  const { toasts, removeToast, config } = useToastContext();
  const { position } = config;

  return createPortal(
    <div className={`toast-container ${position}`} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={removeToast}
          pauseOnHover={config.pauseOnHover}
        />
      ))}
    </div>,
    document.body
  );
});

export default ToastContainer; 