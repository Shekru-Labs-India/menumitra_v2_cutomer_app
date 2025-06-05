import React from 'react';
import BaseModal from '../BaseModal';
import { useOutlet } from '../../../contexts/OutletContext';
import { useModal } from '../../../contexts/ModalContext';

export const OrderTypeModal = () => {
  const { closeModal, modals } = useModal();
  const { updateOrderSettings, orderSettings } = useOutlet();

  const orderTypes = [
    {
      id: 'counter',
      title: 'Counter',
      icon: '🏪'
    },
    {
      id: 'drive-through',
      title: 'Drive Through',
      icon: '🚗'
    },
    {
      id: 'delivery',
      title: 'Delivery',
      icon: '🛵'
    },
    {
      id: 'parcel',
      title: 'Parcel',
      icon: '📦'
    }
  ];

  const handleOrderTypeSelect = (type) => {
    updateOrderSettings({ order_type: type });
    closeModal('orderType');
  };

  return (
    <BaseModal 
      isOpen={modals.orderType}
      title="Select Order Type" 
      onClose={() => closeModal('orderType')}
      size="modal-dialog-centered"
    >
      <div className="p-3">
        <div className="row g-3">
          {orderTypes.map((type) => (
            <div key={type.id} className="col-6">
              <button 
                className={`btn ${orderSettings.order_type === type.id ? 'btn-primary' : 'btn-outline-primary'} w-100 h-100 py-3 d-flex flex-column align-items-center justify-content-center`}
                onClick={() => handleOrderTypeSelect(type.id)}
                style={{
                  borderRadius: '12px',
                  minHeight: '100px',
                  transition: 'all 0.3s ease'
                }}
              >
                <span className="mb-2" style={{ fontSize: '24px' }}>{type.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>{type.title}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
};
