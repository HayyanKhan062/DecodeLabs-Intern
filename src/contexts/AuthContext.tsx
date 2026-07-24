import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  createdAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  authMode: 'login' | 'signup' | 'profile' | 'forgot';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthMode: (mode: 'login' | 'signup' | 'profile' | 'forgot') => void;
  openAuthModal: (mode?: 'login' | 'signup' | 'profile' | 'forgot') => void;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  signUp: (fullName: string, username: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'axiom_auth_user_v1';

// Default initial user account
const DEFAULT_USER: UserProfile = {
  id: 'usr_hayyan_01',
  fullName: 'Hayyan Khan',
  username: 'hayyan_khan',
  email: 'hayyan6776@gmail.com',
  avatar: '/axiom-logo.jpg',
  provider: 'google',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse auth user state:', e);
    }
    return null; // Guest state by default
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'profile' | 'forgot'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = (mode: 'login' | 'signup' | 'profile' | 'forgot' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const login = async (email: string, _password: string, _rememberMe = true): Promise<boolean> => {
    // Simulate login validation
    const loggedInUser: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName: email.split('@')[0].replace('.', ' '),
      username: email.split('@')[0],
      email,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    setUser(loggedInUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const signUp = async (
    fullName: string,
    username: string,
    email: string,
    _password: string
  ): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      fullName,
      username,
      email,
      provider: 'email',
      createdAt: new Date().toISOString(),
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Simulate interactive Google OAuth sign in
    const googleUser: UserProfile = {
      id: 'usr_google_hayyan',
      fullName: 'Hayyan Khan',
      username: 'hayyan_google',
      email: 'hayyan6776@gmail.com',
      avatar: '/axiom-logo.jpg',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    setUser(googleUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthModalOpen(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('axiom_sessions');
      localStorage.removeItem('axiom_active_session_id');
      localStorage.removeItem('axiom_settings');
    } catch (e) {
      console.error('Failed to clear storage on logout:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthModalOpen,
        authMode,
        setIsAuthModalOpen,
        setAuthMode,
        openAuthModal,
        login,
        signUp,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
