import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthService } from '../services/auth';
import {getDashboard, createUserInBackend, CreateUserDto } from '../services/touch-grass';
import  NewUserScreen  from '../components/pages/NewUserScreen';

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
  const [newUserPayload, setNewUserPayload] = useState<Record<string, any> | null>(null);
  

    function buildNewUserPayload(firebaseUser: User) {
    const displayName = firebaseUser.displayName?.trim() || '';
    const [firstname, lastname] = displayName.split(' ');
    const fallbackUsername = 'new_user';

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

  async function handleAuthStateChanged(firebaseUser: User | null) {
    setUser(firebaseUser);
    setLoading(false);
    if (!firebaseUser) {
      setNewUserPayload(null);
      return;
    }

    try {
      const dashboard = await getDashboard();
      if (dashboard.status == "NEW_USER") {
        // build the payload and show the Welcome screen
        const payload = buildNewUserPayload(firebaseUser);
        setNewUserPayload(payload);
      }
    } catch (err) {
      console.error('[AuthProvider] Backend check failed:', err);
    }
  }
  

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

        AuthService.onAuthStateChanged(handleAuthStateChanged)
      .then(u => (unsubscribe = u))
      .catch(err => {
        console.error('[AuthProvider] Auth check failed:', err);
        setLoading(false);
    });
    return () => unsubscribe?.();
  }, []);

  if (loading) {
    return <></>;
  }

  // If new user, show the welcome screen and let them fill in and submit
  if (newUserPayload) {
    return (
      <NewUserScreen
        payload={newUserPayload}
        onContinue={async (updatedPayload: CreateUserDto) => {
          try {
            await createUserInBackend(updatedPayload);
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
