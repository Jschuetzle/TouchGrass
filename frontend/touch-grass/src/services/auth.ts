// src/services/auth.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  OAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';

export const signUpEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('[signUp] Error with email signup:', error);
    throw error;
  }
};

export const signInEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('[signInEmail] Error:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('[signOut] Error:', error);
    throw error;
  }
};

const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

export const signInGoogle = async () => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    return userCredential.user;
  } catch (error) {
    console.error('[signUp] Error with Google signup:', error);
    throw error;
  }
};

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

export const signInApple = async () => {
  try {
    const userCredential = await signInWithPopup(auth, appleProvider);
    return userCredential.user;
  } catch (error) {
    console.error('[signUp] Error with Apple signup:', error);
    throw error;
  }
};


