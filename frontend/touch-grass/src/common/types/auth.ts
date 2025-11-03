import { 
    FirebaseAuthTypes as FirebaseNativeAuthTypes,
} from '@react-native-firebase/auth';
import { 
    User as FirebaseWebUserType, 
    Auth as FirebaseWebAuth, 
    UserInfo as FirebaseWebUserInfo,
} 
from 'firebase/auth';

export type FirebaseUser = FirebaseWebUserType | FirebaseNativeAuthTypes.User;
export type FirebaseProviderData = FirebaseWebUserInfo | FirebaseNativeAuthTypes.UserInfo;

export type WebAuth = FirebaseWebAuth;
export type NativeAuth = FirebaseNativeAuthTypes.Module;
export type Auth = WebAuth | NativeAuth | null;