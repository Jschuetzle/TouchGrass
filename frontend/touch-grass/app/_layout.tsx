import { Stack } from 'expo-router';
import { UserProvider, useUserContext } from '@/contexts/UserContext';
import { SplashScreenController } from '@/components/controllers/splash-screen';


export default function RootLayout() {
  return (
    <UserProvider>
      <SplashScreenController />
      <RootNavigator />
    </UserProvider>
  );
}

function RootNavigator() {
  const { firebaseUser } = useUserContext();

  return (
    <Stack>
      <Stack.Protected guard={!!firebaseUser}>
        <Stack.Screen name="(authenticated)" />
      </Stack.Protected>

      <Stack.Protected guard={!firebaseUser}>
        <Stack.Screen name="signin" />
      </Stack.Protected>
    </Stack>
  );
}
