import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const API_BASE_URL = 'https://men4u.xyz/v2';

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load user data from localStorage on component mount
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const userData = JSON.parse(authData);
        setFormData({
          name: userData.name || '',
          phoneNumber: userData.mobile || ''
        });
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setFormData(prev => ({ ...prev, phoneNumber: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setIsLoading(false);
      return;
    }

    if (formData.phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      setIsLoading(false);
      return;
    }

    try {
      const authData = localStorage.getItem('auth');
      if (!authData) {
        setError('Authentication data not found');
        setIsLoading(false);
        return;
      }

      const userData = JSON.parse(authData);
      
      const response = await fetch(`${API_BASE_URL}/user/account_profile_update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${userData.accessToken}`
        },
        body: JSON.stringify({
          mobile: formData.phoneNumber,
          name: formData.name,
          user_id: userData.userId
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage with new values
        const updatedAuthData = {
          ...userData,
          name: data.customer_details.name,
          mobile: data.customer_details.mobile
        };
        localStorage.setItem('auth', JSON.stringify(updatedAuthData));

        // Show success message
        setError('Profile updated successfully');
        document.querySelector('.alert')?.classList.replace('alert-danger', 'alert-success');
        
        // Navigate with replace after showing success message briefly
        setTimeout(() => {
          navigate('/profile', { replace: true });
        }, 1000);
      } else {
        throw new Error(data.detail || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="container">
          <div className="edit-profile">
            <div className="profile-image">
              <div className="media media-100 rounded-circle">
                <img src="https://placehold.co/300x200?text=No+Image+Found" alt="/" />
              </div>
              <a href="javascript:void(0);">Change profile photo</a>
            </div>
            {error && (
              <div className="alert alert-danger py-2 mb-3">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text">+91</span>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="Enter your phone number"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                </div>
                <small className="text-muted">Enter 10 digit mobile number</small>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </form>
          </div>
          {/* <ul className="link-list">
            <li>
              <a href="javascript:void(0);">Add Link</a>
            </li>
            <li>
              <a href="javascript:void(0);">Switch to professional account</a>
            </li>
            <li>
              <a href="javascript:void(0);">Create avatar</a>
            </li>
            <li>
              <a href="javascript:void(0);">Personal information settings</a>
            </li>
          </ul> */}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default EditProfile;
