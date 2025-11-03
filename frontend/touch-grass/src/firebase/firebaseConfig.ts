import { getApp, setReactNativeAsyncStorage } from '@react-native-firebase/app';
import { getAuth as getAuthNative } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getAuth as getAuthWeb } from 'firebase/auth';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Auth } from '@/common/types/auth';

let auth: Auth;
let isInitializing = false;

const initFirebase = async () => {
  if (auth || isInitializing) return;
  isInitializing = true;

  try {
    if (Platform.OS === 'web') {
      // need to manually configure web
      const firebaseConfig = {
        apiKey: Constants.expoConfig.extra.firebaseApiKey,
        authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
        projectId: Constants.expoConfig.extra.firebaseProjectId,
        appId: Constants.expoConfig.extra.firebaseAppId,
      };

      const firebaseApp = initializeApp(firebaseConfig);
      auth = getAuthWeb(firebaseApp);
      auth.useDeviceLanguage();
    } 
    else {
      // automatically configured through Service Account Files
      auth = getAuthNative(getApp());
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  } finally {
    isInitializing = false;
  }
};

export const getAuthInstance = async () => {
  if (auth) return auth;

  await initFirebase();
  return auth;
};