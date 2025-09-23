import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

// Device info constant
const DEVICE_INFO = {
  fcm_token: "457896354789",
  device_id: "8974561234",
  device_model: "Laptop 122"
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showAuthOffcanvas, setShowAuthOffcanvas] = useState(false);

  // Internal helper function to get auth data from localStorage
  const getAuthData = useCallback(() => {
    try {
      const authData = localStorage.getItem('auth');
      return authData ? JSON.parse(authData) : null;
    } catch (error) {
      console.error('Error parsing auth data:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Check localStorage for existing auth data on mount
    const authData = getAuthData();
    if (authData) {
      setUser({
        id: authData.userId,
        name: authData.name,
        role: authData.role,
        mobile: authData.mobile,
        accessToken: authData.accessToken,
        expiresAt: authData.expiresAt
      });
    }
  }, [getAuthData]);

  const handleLoginSuccess = (userData) => {
    // Store auth data in localStorage
    const auth = {
      userId: userData.user_id,
      name: userData.name,
      role: userData.role,
      mobile: userData.mobile,
      accessToken: userData.access_token,
      expiresAt: userData.expires_at
    };
    
    localStorage.setItem('auth', JSON.stringify(auth));
    
    setUser({
      id: userData.user_id,
      name: userData.name,
      role: userData.role,
      mobile: userData.mobile,
      accessToken: userData.access_token,
      expiresAt: userData.expires_at
    });
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth');
    setUser(null);
  }, []);

  // Auth utility functions using React state
  const isAuthenticated = useCallback(() => {
    if (!user) return false;
    const expiresAt = new Date(user.expiresAt).getTime();
    const now = new Date().getTime();
    return user.accessToken && expiresAt > now;
  }, [user]);

  const getAccessToken = useCallback(() => user?.accessToken, [user]);
  const getUserRole = useCallback(() => user?.role, [user]);
  const getUserId = useCallback(() => user?.id, [user]);
  const getUserMobile = useCallback(() => user?.mobile, [user]);
  const getUserName = useCallback(() => user?.name, [user]);
  const getDeviceInfo = useCallback(() => DEVICE_INFO, []);

  return (
    <AuthContext.Provider 
      value={{
        user,
        isAuthenticated, // Remove the () - provide the function, not its result
        showAuthOffcanvas,
        setShowAuthOffcanvas,
        handleLoginSuccess,
        handleLogout,
        // Expose utility functions
        getAccessToken,
        getUserRole,
        getUserId,
        getUserMobile,
        getUserName,
        getDeviceInfo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
