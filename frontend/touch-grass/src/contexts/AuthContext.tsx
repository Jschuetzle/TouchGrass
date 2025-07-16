// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthService } from '../services/auth';
import { checkUserExists, createUserInBackend } from '../services/touch-grass';

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

  async function handleAuthStateChanged(user: User) {
    setUser(user);

    if (user) {
      try {
        const exists = await checkUserExists(user.uid);
        if (!exists) {
          console.log('[AuthProvider] User does not exist in backend. Creating...');
          await createUserInBackend(user);
        } else {
          console.log('[AuthProvider] User exists in backend');
        }
      } catch (err) {
        console.error('[AuthProvider] Error checking/creating backend user:', err);
      }
    }

    setLoading(false);
  }

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const checkAuth = async () => {
      try {
        unsubscribe = await AuthService.onAuthStateChanged(handleAuthStateChanged);
      } catch (error) {
        console.error('[AuthProvider] Auth check failed:', error);
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      if (unsubscribe) return unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
