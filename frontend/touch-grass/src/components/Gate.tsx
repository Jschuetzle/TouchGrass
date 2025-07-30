import { useAuth } from '../contexts/AuthContext';
import { Redirect, usePathname } from 'expo-router';
import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Gate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const isOnSignIn = pathname.startsWith('/signin');

  if (loading) return null;

  if (!user && !isOnSignIn) return <Redirect href="/signin" />;
  if (user && isOnSignIn) return <Redirect href="/(tabs)" />;

  console.log('[Gate]', { pathname });

  return (
    <SafeAreaView style={{ flex: 1 }} edges={[]}>   
      {children}
    </SafeAreaView>
  );
}
