import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import Gate from '../src/components/Gate';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Gate>
        <Stack screenOptions={{ headerShown: false }} />
      </Gate>
    </AuthProvider>
  );
}
