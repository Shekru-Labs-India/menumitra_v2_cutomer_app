import React from 'react';
import BaseModal from '../BaseModal';

function OrderExistsModal({ 
  isOpen, 
  onClose, 
  orderNumber,
  onCancelExisting, 
  onAddToExisting,
  isLoading
}) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="modal-dialog-centered"
      title="Existing Order Found"
    >
      <div className="text-center px-4">
        <p className="mb-4">
          You have an ongoing order (#{orderNumber}). Would you like to cancel this order and create a new one?
        </p>

        <div className="d-grid gap-2">
          <button 
            className="btn text-white"
            style={{
              backgroundColor: '#FF3B30',
            }}
            onClick={onCancelExisting}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              'Cancel Existing & Create New Order'
            )}
          </button>
          
          <button 
            className="btn text-white"
            style={{
              backgroundColor: '#007AFF',
            }}
            onClick={onAddToExisting}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Processing...
              </>
            ) : (
              `Add To Existing Order (#${orderNumber})`
            )}
          </button>

          <button 
            className="btn btn-light text-black"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

export default OrderExistsModal;