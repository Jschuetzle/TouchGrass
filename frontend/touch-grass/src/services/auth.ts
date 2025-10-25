// src/services/auth.ts
import { Platform } from 'react-native';
import { getAuthInstance } from '@/firebase/firebaseConfig';
import { 
  signInWithCredential, 
  GoogleAuthProvider as GoogleAuthProviderNative, 
  createUserWithEmailAndPassword as createUserWithEmailAndPasswordNative,
  signInWithEmailAndPassword as signInWithEmailAndPasswordNative,
  onAuthStateChanged as onAuthStateChangedNative,
} from '@react-native-firebase/auth';
import { 
  signInWithPopup, 
  GoogleAuthProvider as GoogleAuthProviderWeb, 
  Unsubscribe, 
  createUserWithEmailAndPassword as createUserWithEmailAndPasswordWeb, 
  signInWithEmailAndPassword as signInWithEmailAndPasswordWeb,
  onAuthStateChanged as onAuthStateChangedWeb,
} from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { Auth, NativeAuth, FirebaseUser, WebAuth } from '@/common/types/auth';

GoogleSignin.configure({
  webClientId: Constants.expoConfig.extra.firebaseWebClientId,
});

class AuthServiceClass {
  private auth: Auth = null;
  private platform: string = Platform.OS;
  private googleProviderWeb = new GoogleAuthProviderWeb();

  private async ensureAuthInstance() {
    if (!this.auth) {
      this.auth = await getAuthInstance();

      if (this.platform === 'web') {
        (this.auth! as WebAuth).useDeviceLanguage();
      }
    }
  }


  public async onAuthStateChanged(callback: (user: FirebaseUser) => void): Promise<Unsubscribe> {
    await this.ensureAuthInstance();
    return (this.platform === 'web') ? onAuthStateChangedWeb((this.auth as WebAuth), callback) : onAuthStateChangedNative((this.auth as NativeAuth), callback);
  }


  async authenticateWithEmail(email: string, password: string, isSignup: boolean): Promise<boolean> {
    await this.ensureAuthInstance();

    // code duplication here is ok
    // general assignment of authFunction won't allow passing in of opposite platform auth type
    try {
      if (this.platform === 'web') {
        const authFunction = isSignup ? createUserWithEmailAndPasswordWeb : signInWithEmailAndPasswordWeb;
        await authFunction((this.auth as WebAuth), email, password);
      }
      else {
        const authFunction = isSignup ? createUserWithEmailAndPasswordNative : signInWithEmailAndPasswordNative;
        await authFunction((this.auth as NativeAuth), email, password);
      }

      return true;
    } 
    catch (error) {
      console.error(`[${isSignup ? "signUp" : "signIn"}] Error with email signup:`, error);
      return false;
    }
  }


  async googleAuth(): Promise<boolean> {
    await this.ensureAuthInstance();

    try {
      if (this.platform === 'web') {
        await signInWithPopup((this.auth as WebAuth), this.googleProviderWeb);
      } 
      else {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        const response = await GoogleSignin.signIn();

        const idToken = response.data?.idToken;
        if (!idToken) {
          throw new Error('No ID token found in GoogleSignIn response');
        }

        const googleCredential = GoogleAuthProviderNative.credential(response.data.idToken);
        await signInWithCredential((this.auth as NativeAuth), googleCredential);
      }
      return true;
    } 
    catch (error) {
      console.log("[ERROR] Google sign in: ", error);
      return false;
    }  
  }


  async signOut(): Promise<void> {
    try {
      await this.ensureAuthInstance();

      // For Android, if only one account has been added to Google Play Services, the RN GoogleSignin
      // lib will use that account by default, i.e. the modal for choosing a Google account won't appear
      // To fix this, we signout via GoogleSignin lib in addition to firebase signout
      await GoogleSignin.signOut();

      this.auth.signOut();
      // SHOULD GoogleSignin.revokeAccess() BE USED HERE?
    }
    catch (error) {
      console.error('[signOut] Error:', error);
      throw error;
    }
  }


  async getCurrentUser(): Promise<FirebaseUser | null> {
    await this.ensureAuthInstance();
    return this.auth.currentUser;
  }

  async getIdToken(): Promise<string | null> {
    await this.ensureAuthInstance();
    const user = this.auth?.currentUser;
    return user ? await user.getIdToken() : null;
  }

}

// exporting as so makes the AuthService behave as singleton
export const AuthService = new AuthServiceClass();