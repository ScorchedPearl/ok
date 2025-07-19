import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { UserProfile, KeycloakTokenResponse } from './types';

interface AuthContextType {
  token: KeycloakTokenResponse | null;
  realm: string | null;
  user: UserProfile | null;
  login: (realm: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  checkFirstTimeLogin: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<KeycloakTokenResponse | null>(() => {
    const savedToken = localStorage.getItem('token');
    try {
      return savedToken ? JSON.parse(savedToken) : null;
    } catch {
      return null;
    }
  });

  const [realm, setRealm] = useState<string | null>(localStorage.getItem('realm'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isFirstLogin, setIsFirstLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const roles = token.realm_access?.roles || [];
        const isTenant = realm === 'tenant-realm' || roles.includes('tenant');
        const isPartner = realm === 'partner-realm' || roles.includes('partner');

        let userProfile: UserProfile;

        if (isTenant) {
          userProfile = await api.auth.getTenantProfile(token);
        } else if (isPartner) {
          userProfile = await api.auth.getPartnerProfile(token);
        } else {
          userProfile = await api.auth.getCandidateProfile(token);
        }

        setUser(userProfile);

        if (userProfile.userId) {
          await checkFirstTimeLogin();
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [token]);

  // Token refresh logic
  useEffect(() => {
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (!token || !realm || !storedRefreshToken) {
      logout();
      return;
    }

    const refreshTokens = async () => {
      try {
        const response = await api.auth.refreshToken(realm, storedRefreshToken);
        setToken(response);
        localStorage.setItem('token', JSON.stringify(response));
        localStorage.setItem('refreshToken', response.refresh_token);
      } catch (error) {
        console.error('Token refresh failed:', error);
        logout();
      }
    };

    const checkTokenExpiration = () => {
      if (token && api.auth.isTokenExpiringSoon(token)) {
        refreshTokens();
      }
    };

    checkTokenExpiration(); // Check once immediately
    const interval = setInterval(checkTokenExpiration, 60 * 1000);

    return () => clearInterval(interval);
  }, [token, realm]);

  const login = async (realm: string, username: string, password: string) => {
    try {
      const response = await api.auth.login(realm, username, password);
      setToken(response);
      setRealm(realm);

      localStorage.setItem('token', JSON.stringify(response));
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('realm', realm);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setRealm(null);
    setUser(null);
    setIsFirstLogin(false);
    setLoading(false);

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('realm');
  };

  const checkFirstTimeLogin = async (): Promise<boolean> => {
    if (!user?.userId || !token || !realm) {
      return false;
    }

    try {
      const response = await api.users.checkFirstTimeLogin(token, realm);
      setIsFirstLogin(response.isFirstLogin);
      return response.isFirstLogin;
    } catch (error) {
      console.error('Error checking first-time login status:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        realm,
        user,
        login,
        logout,
        isAuthenticated: !!token,
        isFirstLogin,
        checkFirstTimeLogin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
