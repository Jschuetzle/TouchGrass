import { GateProps } from '@/common/types/props/Gate';
import { useAuthContext } from '../contexts/AuthContext';
import { Redirect, usePathname } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Gate({ children, authenticationInProgress }: GateProps) {
  const { firebaseUser: firebaseUser } = useAuthContext();

  const pathname = usePathname();
  const isOnSignIn = pathname.startsWith('/signin');

  console.log(`Current Path: ${pathname}`);

  if (authenticationInProgress) {
    return <ActivityIndicator size="large" />;
  } 
  else if (!firebaseUser && !isOnSignIn) {
    return <Redirect href="/signin" />;
  } 
  else if (firebaseUser && isOnSignIn) {
    return <Redirect href="/(authenticated)/(tabs)" />;
  } 
  else {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={[]}>   
        {children}
      </SafeAreaView>
    );
  }
}
