import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.user) {
      setUser(response.data.user);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    }
    return response.data?.user;
  };

  const register = async ({ name, email, password, role }) => {
    const response = await api.post('/auth/register', { name, email, password, role });
    if (response.data?.user) {
      setUser(response.data.user);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    }
    return response.data?.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network failure on logout
    } finally {
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const updateProfile = async (profileData) => {
    const response = await api.patch('/auth/update-profile', profileData);
    if (response.data?.user) {
      setUser(response.data.user);
    }
    return response.data?.user;
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.role || null,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: fetchCurrentUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
