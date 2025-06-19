import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAoM4xFCuy4SYgeuDDD9HVKu6F-793icn4',
  authDomain: 'touch-f2af2.firebaseapp.com',
  projectId: 'touch-f2af2',
  storageBucket: 'touch-f2af2.appspot.com',
  messagingSenderId: '166953590796',
  appId: '1:166953590796:web:8de8aca39f7821c7030e29',
  measurementId: 'G-VCGTNYR37W',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);