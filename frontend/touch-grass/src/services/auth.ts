// src/services/auth.ts
import { Platform } from 'react-native';
import { getAuthInstance } from '../firebase/firebaseConfig';
import { signInWithCredential, GoogleAuthProvider as GoogleAuthProviderNative } from '@react-native-firebase/auth';
import { signInWithPopup, GoogleAuthProvider as GoogleAuthProviderWeb } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { Auth, AuthModule, NativeAuth, NativeAuthModule, FirebaseUser, WebAuth, WebAuthModule } from '@/common/types/auth';

GoogleSignin.configure({
  webClientId: Constants.expoConfig.extra.firebaseWebClientId,
});

class AuthServiceClass {
  private auth: Auth = null;
  private authModule: AuthModule = null;
  private googleProviderWeb = new GoogleAuthProviderWeb();

  private async ensureAuthInstance() {
    if (!this.auth) {
      this.auth = await getAuthInstance();
    }
  }

  private async ensureAuthModule() {
    if (!this.authModule) {
      this.authModule = (Platform.OS === 'web')
        ? await import('firebase/auth')
        : require('@react-native-firebase/auth');
    }
  }

  async emailAuth(email: string, password: string, isSignup: boolean): Promise<FirebaseUser> {
    await this.ensureAuthInstance();
    await this.ensureAuthModule();

    // to ensure type safety within the 'auth' param of authFunction
    if (Platform.OS === 'web') {
      const auth = this.auth as WebAuth;
      const authModule = this.authModule as WebAuthModule;
      const authFunction = isSignup
        ? authModule.createUserWithEmailAndPassword
        : authModule.signInWithEmailAndPassword;

        try {
          const userCredential = await authFunction(auth, email, password);
          return userCredential.user;
        }
        catch (error) {
          console.error(`[${isSignup ? "signUp" : "signIn"}] Error with email signup:`, error);
          throw error;
        }
    }
    else {
      const auth = this.auth as NativeAuth;
      const authModule = this.authModule as NativeAuthModule;
      const authFunction = isSignup
        ? authModule.createUserWithEmailAndPassword
        : authModule.signInWithEmailAndPassword;

        try {
          const userCredential = await authFunction(auth, email, password);
          return userCredential.user;
        }
        catch (error) {
          console.error(`[${isSignup ? "signUp" : "signIn"}] Error with email signup:`, error);
          throw error;
        }
    }
  }

  public async onAuthStateChanged(callback: (user: FirebaseUser) => void): Promise<() => void> {
    await this.ensureAuthInstance();
    await this.ensureAuthModule();

    if (Platform.OS === 'web') {
      const auth = this.auth as WebAuth;
      const authModule = this.authModule as WebAuthModule;
      return authModule.onAuthStateChanged(auth, callback);
    }
    else {
      const auth = this.auth as NativeAuth;
      const authModule = this.authModule as NativeAuthModule;
      return authModule.onAuthStateChanged(auth, callback);
    }
  }

  async signOut(setAuthLoading: (isLoading) => void): Promise<void> {
    setAuthLoading(true);

    try {
      await this.ensureAuthInstance();
      this.auth.signOut();
      // SHOULD GoogleSignin.revokeAccess() BE USED HERE?
    }
    catch (error) {
      console.error('[signOut] Error:', error);
      throw error;
    } 
    finally {
      setAuthLoading(false);
    }
  }

  async googleAuth() {
    await this.ensureAuthInstance();
    await this.ensureAuthModule();

    try {
      if (Platform.OS === 'web') {
        const auth = this.auth as WebAuth;
        const userCredential = await signInWithPopup(auth, this.googleProviderWeb);
        return userCredential.user;
      } else {
        const auth = this.auth as NativeAuth;
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        const idToken = response.data?.idToken;
        if (!idToken) {
          throw new Error('No ID token found in GoogleSignIn response');
        }

        const googleCredential = GoogleAuthProviderNative.credential(response.data.idToken);
        const userCredential = await signInWithCredential(auth, googleCredential);
        return userCredential.user;
      }
    } catch (error) {
      console.log("[ERROR] Google sign in: ", error);
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