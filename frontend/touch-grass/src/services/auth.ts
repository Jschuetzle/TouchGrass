// src/services/auth.ts
import { Platform } from 'react-native';
import { getAuthInstance } from '../firebase/firebaseConfig';
import { FirebaseAuthTypes as FirebaseNativeAuthTypes } from '@react-native-firebase/auth';
import { User as FirebaseWebUserType, Auth as FirebaseWebAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export type User = FirebaseWebUserType | FirebaseNativeAuthTypes.User;
type Auth = FirebaseWebAuth | FirebaseNativeAuthTypes.Module | null;
type NativeAuthModule = typeof import('@react-native-firebase/auth');
type WebAuthModule = typeof import('firebase/auth')
type AuthModule = NativeAuthModule | WebAuthModule | null;

GoogleSignin.configure();

class AuthServiceClass {
  private auth: Auth = null;
  private authModule: AuthModule = null;
  private googleProvider = new GoogleAuthProvider();

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

  async emailAuth(email: string, password: string, isSignup: boolean): Promise<User> {
    await this.ensureAuthInstance();
    await this.ensureAuthModule();

    // to ensure type safety within the 'auth' param of authFunction
    if (Platform.OS === 'web') {
      const auth = this.auth as FirebaseWebAuth;
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
      const auth = this.auth as FirebaseNativeAuthTypes.Module;
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

  public async onAuthStateChanged(callback: (user: User) => void): Promise<() => void> {
    await this.ensureAuthInstance();
    await this.ensureAuthModule();

    if (Platform.OS === 'web') {
      const auth = this.auth as FirebaseWebAuth;
      const authModule = this.authModule as WebAuthModule;
      return authModule.onAuthStateChanged(auth, callback);
    }
    else {
      const auth = this.auth as FirebaseNativeAuthTypes.Module;
      const authModule = this.authModule as NativeAuthModule;
      return authModule.onAuthStateChanged(auth, callback);
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.ensureAuthInstance();
      this.auth.signOut();
      // SHOULD GoogleSignin.revokeAccess() BE USED HERE?
    }
    catch (error) {
      console.error('[signOut] Error:', error);
      throw error;
    }
    this.auth.signOut();
  }

  async googleAuth() {
    await this.ensureAuthInstance();
    await this.ensureAuthModule();

    try {
      const auth = this.auth as FirebaseWebAuth;
      const userCredential = await signInWithPopup(auth, this.googleProvider)
      return userCredential.user;
    } catch (error) {
      console.log("Google Authentication Error: ", error)
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    await this.ensureAuthInstance();
    return this.auth.currentUser;
  }
}

// exporting as so makes the AuthService behave as singleton
export const AuthService = new AuthServiceClass();