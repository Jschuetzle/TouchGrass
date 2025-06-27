import { getApp, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

if (Platform.OS === 'web') {
  const firebaseConfig = {
    apiKey: Constants.expoConfig.extra.firebaseApiKey,
    authDomain: Constants.expoConfig.extra.firebaseAuthDomain,
    projectId: Constants.expoConfig.extra.firebaseProjectId,
    appId: Constants.expoConfig.extra.firebaseAppId
  };

  initializeApp(firebaseConfig);
}

const firebaseApp = getApp();
export const auth = getAuth(firebaseApp);