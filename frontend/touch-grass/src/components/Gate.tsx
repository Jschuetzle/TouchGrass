import { useAuth } from '../contexts/AuthContext';
import { Redirect, usePathname } from 'expo-router';
import { ReactNode, useEffect, useState } from 'react';

export default function Gate({ children }: { children: ReactNode }) {
  
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isOnSignIn = pathname.startsWith('/signin');

  if (loading) return null;

  if (!user && !isOnSignIn) return <Redirect href="/signin" />;
  if (user && isOnSignIn) return <Redirect href="/(tabs)" />;


  console.log('[Gate]', { pathname, user });

  return <>{children}</>;
}
