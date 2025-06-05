import React, { useState, useEffect } from 'react';
import BaseModal from '../BaseModal';
import { useCart } from '../../../contexts/CartContext';
import { useModal } from '../../../contexts/ModalContext';
import { useAuth } from '../../../contexts/AuthContext';

export const AddToCartModal = () => {
  const { closeModal, modalConfig } = useModal();
  const { addToCart, cartItems } = useCart();
  const { user, setShowAuthOffcanvas } = useAuth();
  
  console.log('Modal Config Data:', modalConfig.data);
  console.log('Current Cart Items:', cartItems);

  // Track quantities for all portions
  const [quantities, setQuantities] = useState(() => {
    const initial = {};
    modalConfig.data?.portions?.forEach(portion => {
      const cartItem = cartItems.find(item => 
        item.menuId === modalConfig.data?.menuId && 
        item.portionId === portion.portion_id
      );
      initial[portion.portion_id] = cartItem?.quantity || 0;
    });
    return initial;
  });

  // Track comments for all portions
  const [comments, setComments] = useState(() => {
    const initial = {};
    modalConfig.data?.portions?.forEach(portion => {
      const cartItem = cartItems.find(item => 
        item.menuId === modalConfig.data?.menuId && 
        item.portionId === portion.portion_id
      );
      initial[portion.portion_id] = cartItem?.comment || '';
    });
    return initial;
  });

  const [selectedPortion, setSelectedPortion] = useState(
    modalConfig.data?.portions?.[0]?.portion_id
  );
  
  const MAX_QUANTITY = 20;

  console.log('Initial Selected Portion:', selectedPortion);
  console.log('Initial Quantities:', quantities);

  // Check if item exists in cart
  const isInCart = cartItems.some(item => 
    item.menuId === modalConfig.data?.menuId
  );

  // Find existing cart item for current portion
  const getCurrentCartItem = (portionId) => {
    return cartItems.find(item => 
      item.menuId === modalConfig.data?.menuId && 
      item.portionId === portionId
    );
  };

  // Update quantity when portion changes
  const handlePortionChange = (portionId) => {
    console.log('Portion Change:', {
      from: selectedPortion,
      to: portionId
    });
    
    setSelectedPortion(portionId);
  };

  // Set modal title based on cart status and include menu name
  const modalTitle = `${isInCart ? "Update" : "Add"} - ${modalConfig.data?.menuName || modalConfig.data?.menu_name || ''}`;

  // Add auth check at the start of the component
  useEffect(() => {
    const authData = localStorage.getItem('auth');
    if (!authData || !user) {
      closeModal('addToCart'); // Close the cart modal
      setShowAuthOffcanvas(true); // Show auth modal
      return;
    }
  }, [user, closeModal, setShowAuthOffcanvas]);

  const handleQuantityChange = (newQuantity) => {
    // Check if user is authenticated
    const authData = localStorage.getItem('auth');
    if (!authData || !user) {
      closeModal('addToCart'); // Close the cart modal
      setShowAuthOffcanvas(true); // Show auth modal
      return;
    }

    console.log('Quantity Change:', {
      currentQuantity: quantities[selectedPortion],
      newQuantity: newQuantity,
      selectedPortion: selectedPortion,
      maxQuantity: MAX_QUANTITY,
      isInCart
    });

    const finalQuantity = Math.min(Math.max(0, newQuantity), MAX_QUANTITY);
    setQuantities(prev => ({
      ...prev,
      [selectedPortion]: finalQuantity
    }));

    // Only update cart immediately if item is already in cart
    if (isInCart && modalConfig.data) {
      addToCart(
        modalConfig.data, 
        selectedPortion, 
        finalQuantity, 
        comments[selectedPortion] || ''
      );
    }
  };

  // Update comment handler to work with selected portion
  const handleCommentChange = (newComment) => {
    if (newComment.length <= 30) {
      setComments(prev => ({
        ...prev,
        [selectedPortion]: newComment
      }));
    }
  };

  // Update suggestion handler
  const handleSuggestionClick = (suggestionText) => {
    const currentComment = comments[selectedPortion];
    const isSelected = currentComment.includes(suggestionText);
    
    if (isSelected) {
      // Remove the suggestion
      const suggestions = currentComment.split(', ');
      const filteredSuggestions = suggestions.filter(s => s !== suggestionText);
      const newComment = filteredSuggestions.join(', ');
      if (newComment.length <= 30) {
        handleCommentChange(newComment);
      }
    } else {
      // Add the suggestion if within limits
      const newComment = currentComment ? `${currentComment}, ${suggestionText}` : suggestionText;
      if (newComment.length <= 30) {
        handleCommentChange(newComment);
      }
    }
  };

  // Update handleAddToCart to include portion-specific comments
  const handleAddToCart = () => {
    // Check if user is authenticated
    const authData = localStorage.getItem('auth');
    if (!authData || !user) {
      closeModal('addToCart'); // Close the cart modal
      setShowAuthOffcanvas(true); // Show auth modal
      return;
    }

    console.log('Final Cart Update:', {
      menuData: modalConfig.data,
      selectedPortion: selectedPortion,
      quantity: quantities[selectedPortion],
      comment: comments[selectedPortion],
      isInCart
    });
    
    // Add/Update all portions at once
    Object.entries(quantities).forEach(([portionId, quantity]) => {
      if (quantity > 0) {
        addToCart(
          modalConfig.data, 
          Number(portionId), 
          quantity, 
          comments[portionId] || ''
        );
      }
    });
    closeModal('addToCart');
  };

  // Add a function to check if any portion has quantity > 0
  const hasValidQuantity = () => {
    return Object.values(quantities).some(quantity => quantity > 0);
  };

  return (
    <BaseModal 
      isOpen={true}
      title={modalTitle} 
      onClose={closeModal}
    >
      <div className="mb-4">
        <label className="text-secondary mb-2" style={{ fontSize: '14px' }}>
          Select Portion
        </label>
        <div className="row g-2">
          {modalConfig.data?.portions?.length > 0 ? (
            modalConfig.data.portions.map(portion => (
              <div 
                className={
                  modalConfig.data.portions.length === 1 ? 'col-12' : 
                  modalConfig.data.portions.length === 2 ? 'col-6' : 
                  'col-4'
                }
                key={portion.portion_id}
              >
                <div 
                  onClick={() => handlePortionChange(portion.portion_id)}
                  style={{
                    border: `1.5px solid ${selectedPortion === portion.portion_id ? '#28a745' : '#e9ecef'}`,
                    borderRadius: '12px',
                    padding: '12px 8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: selectedPortion === portion.portion_id ? '#f8fff8' : 'white',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <div className="d-flex flex-column align-items-center">
                    <span style={{ 
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#212529',
                      marginBottom: '4px'
                    }}>
                      ₹{portion.price}
                    </span>
                    <span style={{ 
                      fontSize: '13px',
                      color: '#6c757d',
                      textTransform: 'capitalize'
                    }}>
                      {portion.portion_name.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center text-muted">
              No portion sizes available
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-secondary mb-2 d-flex justify-content-between align-items-center">
          <span style={{ fontSize: '14px' }}>
            Special Instructions for {
              modalConfig.data?.portions?.find(p => p.portion_id === selectedPortion)?.portion_name
            }
          </span>
          <small style={{ 
            color: (comments[selectedPortion]?.length || 0) > 30 ? '#dc3545' : '#6c757d',
            fontSize: '12px' 
          }}>
            {comments[selectedPortion]?.length || 0}/30
          </small>
        </label>

        {/* Quick Suggestions */}
        <div className="d-flex flex-wrap gap-2 mb-3">
          {[
            { icon: '🌶️', text: 'Extra spicy' },
            { icon: '🥬', text: 'No onions' },
            { icon: '🧄', text: 'No garlic' },
            { icon: '🥄', text: 'Extra sauce' },
            { icon: '🔥', text: 'Well done' },
            { icon: '🥗', text: 'Less spicy' },
            { icon: '🥚', text: 'No egg' },
            { icon: '🥜', text: 'No nuts' }
          ].map((suggestion, index) => {
            const isSelected = comments[selectedPortion]?.includes(suggestion.text);

            return (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                style={{
                  backgroundColor: isSelected ? '#e8f5e9' : '#f8f9fa',
                  border: `1px solid ${isSelected ? '#28a745' : '#e9ecef'}`,
                  borderRadius: '20px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: isSelected ? '#28a745' : '#6c757d',
                  cursor: comments[selectedPortion]?.length > 30 && !isSelected ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  userSelect: 'none',
                  opacity: comments[selectedPortion]?.length > 30 && !isSelected ? 0.5 : 1
                }}
              >
                <span>{suggestion.icon}</span>
                <span>{suggestion.text}</span>
                {isSelected && <span style={{ marginLeft: '4px', fontSize: '10px' }}>✓</span>}
              </div>
            );
          })}
        </div>

        {/* Comment textarea */}
        <div className="position-relative">
          <textarea
            className="form-control"
            value={comments[selectedPortion] || ''}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder={`Add instructions for ${
              modalConfig.data?.portions?.find(p => p.portion_id === selectedPortion)?.portion_name
            } portion...`}
            style={{
              border: `1.5px solid ${
                comments[selectedPortion]?.length < 5 && comments[selectedPortion]?.length > 0 ? '#dc3545' : 
                comments[selectedPortion]?.length > 30 ? '#dc3545' : 
                '#e9ecef'
              }`,
              borderRadius: '12px',
              padding: '12px',
              paddingRight: '60px',
              fontSize: '14px',
              minHeight: '60px',
              maxHeight: '120px',
              resize: 'vertical',
              backgroundColor: '#f8f9fa',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              if (comments[selectedPortion]?.length <= 30) {
                e.target.style.border = '1.5px solid #28a745';
              }
            }}
            onBlur={(e) => {
              e.target.style.border = comments[selectedPortion]?.length < 5 || comments[selectedPortion]?.length > 30 
                ? '1.5px solid #dc3545' 
                : '1.5px solid #e9ecef';
            }}
          />
          
          {/* Clear button */}
          {comments[selectedPortion] && (
            <button
              onClick={() => handleCommentChange('')}
              className="d-flex align-items-center gap-1"
              style={{
                position: 'absolute',
                right: '12px',
                top: '12px',
                background: '#f1f3f5',
                border: '1px solid #e9ecef',
                borderRadius: '16px',
                padding: '4px 8px',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '12px',
                zIndex: 2
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Validation message */}
        {comments[selectedPortion]?.length > 0 && (
          <small style={{ 
            color: '#dc3545', 
            fontSize: '12px',
            marginTop: '6px',
            display: 'block' 
          }}>
            {comments[selectedPortion]?.length < 5 ? 'Instructions must be at least 5 characters' :
             comments[selectedPortion]?.length > 30 ? 'Instructions cannot exceed 30 characters' : ''}
          </small>
        )}

        {/* Helper text */}
        <small style={{ 
          color: '#6c757d', 
          fontSize: '12px',
          marginTop: comments[selectedPortion]?.length > 0 ? '2px' : '6px',
          display: 'block' 
        }}>
          Click to add/remove suggestions or type your custom instructions
        </small>
      </div>

      <div className="d-flex align-items-center gap-3 mt-4">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #28a745',
            borderRadius: '999px',
            padding: '5px 5px',
            background: 'white',
            flex: '1'
          }}
        >
          <button
            type="button"
            onClick={() => handleQuantityChange(quantities[selectedPortion] - 1)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#07813a',
              color: 'white',
              border: 'none',
              fontSize: '20px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              transition: 'background 0.2s',
              opacity: quantities[selectedPortion] <= 0 ? 0.5 : 1,
            }}
            disabled={quantities[selectedPortion] <= 0}
          >
            –
          </button>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 400,
              color: '#23232b',
              minWidth: '24px',
              textAlign: 'center',
              flex: '1'
            }}
          >
            {quantities[selectedPortion]}
          </span>
          <button
            type="button"
            onClick={() => handleQuantityChange(quantities[selectedPortion] + 1)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#07813a',
              color: 'white',
              border: 'none',
              fontSize: '20px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: '20px',
              transition: 'background 0.2s',
              opacity: quantities[selectedPortion] >= MAX_QUANTITY ? 0.5 : 1,
            }}
            disabled={quantities[selectedPortion] >= MAX_QUANTITY}
          >
            +
          </button>
        </div>

        <button 
          type="button" 
          className="btn btn-success" 
          onClick={handleAddToCart}
          disabled={!hasValidQuantity()}
          style={{
            backgroundColor: '#28a745',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '15px',
            fontWeight: '500',
            flex: '1',
            opacity: hasValidQuantity() ? 1 : 0.5
          }}
        >
        <i class="fa-solid fa-cart-shopping me-2"></i>
          {isInCart ? 'Update Cart' : 'Add to Cart'}
        </button>
      </div>
      {quantities[selectedPortion] >= MAX_QUANTITY && (
        <div className="text-center mt-2" style={{ color: '#dc3545', fontSize: '12px' }}>
          Maximum quantity limit reached
        </div>
      )}
    </BaseModal>
  );
};
