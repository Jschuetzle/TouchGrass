import { FirebaseProviderData, FirebaseUser } from '@/common/types/auth';
import { TouchgrassUser } from '@/common/types/user';

export type UserContextType = {
  touchgrassUser: TouchgrassUser | null;
  setTouchgrassUser: (user: TouchgrassUser) => void;

  loadingTouchgrassUser: boolean;
  setLoadingTouchgrassUser: (isLoading: boolean) => void;

  firebaseUser: FirebaseUser | null;
  firebaseProviderData: FirebaseProviderData | null;
  authenticationInProgress: boolean;
}