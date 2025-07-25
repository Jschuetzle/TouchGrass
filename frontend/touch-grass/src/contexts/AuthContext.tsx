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

  // the new account are we making
  function buildNewUserPayload(firebaseUser: User) {
    const displayName = firebaseUser.displayName?.trim() || '';
    const [firstname, lastname] = displayName.split(' ');
    const fallbackUsername = `user_${firebaseUser.uid.slice(0, 6)}`;

    const body: Record<string, any> = {
      id: firebaseUser.uid,
      username: displayName
        ? displayName.replace(/\s+/g, '_').toLowerCase()
        : fallbackUsername,
      firstname: firstname || 'New',
      lastname: lastname || 'User',
      email: firebaseUser.email || '',
      profile_pic: firebaseUser.photoURL || '',
    };

    const phone = (firebaseUser as any).phoneNumber;
    if (phone && /^\+\d{1,15}$/.test(phone)) {
      body.phone_number = phone;
    }

    return body;
  }


  async function handleAuthStateChanged(firebaseUser: User) {
    setUser(firebaseUser);
    setLoading(false);

    if (!firebaseUser) return;

    try {
      const exists = await checkUserExists(firebaseUser.uid);
      console.log('[AuthProvider] User exists in backend?', exists);

      if (!exists) {
        // build and print the JSON you’d POST to /users
        const newUserBody = buildNewUserPayload(firebaseUser);
        console.log('[AuthProvider] Would create user with payload:', newUserBody);
        // for now we stop here; next we’ll show a Welcome screen
      }
      else {
        // user exists: you can fetch and set your userJson here
      }
    } catch (err) {
      console.error('[AuthProvider] Backend check failed:', err);
    }
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
