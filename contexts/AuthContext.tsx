
import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'customer' | 'employee' | null;

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isManager?: boolean;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole;
  isAuthenticated: boolean;
  isManager: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  loginWithGoogle: (role: UserRole) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  toggleManagerMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    console.log('Login attempt:', email, role);
    // Mock authentication - replace with real authentication later
    // Check if email contains "manager" to simulate manager login
    const isManager = email.toLowerCase().includes('manager');
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role,
      isManager,
    };
    setUser(mockUser);
    setUserRole(role);
  };

  const loginWithGoogle = async (role: UserRole) => {
    console.log('Google login attempt:', role);
    // Mock Google authentication - replace with real OAuth later
    const mockUser: User = {
      id: '1',
      email: 'user@gmail.com',
      name: 'Google User',
      role,
      isManager: false,
    };
    setUser(mockUser);
    setUserRole(role);
  };

  const logout = () => {
    console.log('Logout');
    setUser(null);
    setUserRole(null);
  };

  const switchRole = (role: UserRole) => {
    console.log('Switching role to:', role);
    if (user) {
      setUser({ ...user, role });
      setUserRole(role);
    }
  };

  const toggleManagerMode = () => {
    if (user) {
      setUser({ ...user, isManager: !user.isManager });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole,
        isAuthenticated: !!user,
        isManager: user?.isManager || false,
        login,
        loginWithGoogle,
        logout,
        switchRole,
        toggleManagerMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
