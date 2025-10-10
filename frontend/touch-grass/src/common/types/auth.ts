import { 
    FirebaseAuthTypes as FirebaseNativeAuthTypes, 
    signInWithCredential, 
    GoogleAuthProvider as GoogleAuthProviderNative
} from '@react-native-firebase/auth';
import { 
    User as FirebaseWebUserType, 
    Auth as FirebaseWebAuth, 
    GoogleAuthProvider as GoogleAuthProviderWeb, 
    signInWithPopup,
    UserInfo as FirebaseWebUserInfo
} 
from 'firebase/auth';

export type FirebaseUser = FirebaseWebUserType | FirebaseNativeAuthTypes.User;
export type FirebaseProviderData = FirebaseWebUserInfo | FirebaseNativeAuthTypes.UserInfo;

export type WebAuth = FirebaseWebAuth;
export type NativeAuth = FirebaseNativeAuthTypes.Module;
export type Auth = WebAuth | NativeAuth | null;

export type NativeAuthModule = typeof import('@react-native-firebase/auth');
export type WebAuthModule = typeof import('firebase/auth')
export type AuthModule = NativeAuthModule | WebAuthModule | null;