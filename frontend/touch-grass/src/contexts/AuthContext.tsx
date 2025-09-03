// context/AuthProvider.tsx 
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthService } from '../services/auth';
import NewUserScreen from '../components/pages/NewUserScreen';
import {
  getNewUserPayloadIfNeeded,
  createUser,
} from '../services/user'; 
import type { CreateUserDto } from '../services/touch-grass';

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
  const [newUserPayload, setNewUserPayload] = useState<CreateUserDto | null>(null);

  const handleAuthStateChanged = async (firebaseUser: User | null) => {
    setUser(firebaseUser);
    setLoading(false);

    if (!firebaseUser) {
      setNewUserPayload(null);
      return;
    }

    try {
      const payload = await getNewUserPayloadIfNeeded(firebaseUser);
      setNewUserPayload(payload);
    } catch (err) {
      console.error('[AuthProvider] Backend check failed:', err);
    }
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    AuthService.onAuthStateChanged(handleAuthStateChanged)
      .then((u) => (unsubscribe = u))
      .catch((err) => {
        console.error('[AuthProvider] Auth check failed:', err);
        setLoading(false);
      });

    return () => unsubscribe?.();
  }, []);

  if (loading) return <></>;

  if (newUserPayload) {
    return (
      <NewUserScreen
        payload={newUserPayload}
        onContinue={async (updatedPayload: CreateUserDto) => {
          try {
            await createUser(updatedPayload); 
            setNewUserPayload(null);
          } catch (err) {
            console.error('Failed to create user in backend:', err);
          }
        }}
      />
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
