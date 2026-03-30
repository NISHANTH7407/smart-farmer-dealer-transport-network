import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on init
  useEffect(() => {
    const savedToken = localStorage.getItem('agri_token');
    const savedRole = localStorage.getItem('agri_role');
    const savedUserId = localStorage.getItem('agri_user_id');
    const savedUserName = localStorage.getItem('agri_user_name');

    if (savedToken && savedRole) {
      setToken(savedToken);
      setUser({
        role: savedRole,
        id: savedUserId ? Number(savedUserId) : null,
        name: savedUserName,
      });
    }
    setLoading(false);
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('agri_token', newToken);
    localStorage.setItem('agri_role', userData.role);
    localStorage.setItem('agri_user_id', userData.entityId);   // entityId = farmerId/dealerId
    localStorage.setItem('agri_user_name', userData.name);

    setToken(newToken);
    setUser({ role: userData.role, id: userData.entityId, name: userData.name });
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
    window.location.href = '/login/farmer';
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    isRole: (role) => user?.role === role,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

