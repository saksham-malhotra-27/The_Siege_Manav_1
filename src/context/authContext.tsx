import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  logIn: () => void;
  logOut: () => void;
  token: string | null; // Add token state
  setToken: (token: string | null) => void; // Add setToken function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default is false
  const [token, setToken] = useState<string | null>(null); // Initialize token state

  const logIn = () => {
    setIsLoggedIn(true);
  };

  const logOut = () => {
    setIsLoggedIn(false);
    
    setToken(null); // Clear token on logout
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logIn, logOut, token, setToken }}>
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
