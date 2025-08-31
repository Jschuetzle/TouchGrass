import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthService } from '../services/auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function handleAuthStateChanged(user: User) {
    setUser(user);
    setLoading(false);
  }

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const checkAuth = async () => {
      try {
        unsubscribe = await AuthService.onAuthStateChanged(handleAuthStateChanged);
      } catch (error) {
        console.error("Failed to set up Auth Listener:", error);
        setLoading(false);
      }
    };

    checkAuth();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
