import { useUserContext } from '@/contexts/UserContext';
import { SplashScreen } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { authenticationInProgress } = useUserContext();

  if (!authenticationInProgress) {
    SplashScreen.hide();
  }

  return null;
}
