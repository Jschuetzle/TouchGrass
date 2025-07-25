// src/services/touch-grass.ts
import Constants from 'expo-constants';
import { secureFetch } from './api';
import { User } from './auth';

const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}`;

// Check if the Firebase-authenticated user exists in your backend
export async function checkUserExists(uid: string): Promise<boolean> {
  const response = await secureFetch(`${BASE_URL}/users/exists/${uid}`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(`Failed to check user existence: ${response.status}`);
  }

  const json = await response.json();
  return json.exists;
}

export async function getUser(uid: string) {
  try{
    const response = await secureFetch(`${BASE_URL}/users/exists/${uid}`, {
      method: 'GET',})
  
    if(!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }     
  return await response.json();
  } catch (err) {
  console.error('Error fetching /user:', err);
  throw err;
  }

}

export async function getUsers() {
  try {
    const response = await secureFetch(`${BASE_URL}/users`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error fetching /users:', err);
    throw err;
  }
}

import { v4 as uuidv4 } from 'uuid';


export async function createUserInBackend(firebaseUser: User): Promise<any> {
  const displayName = firebaseUser.displayName?.trim() || '';
  const [firstname, lastname] = displayName.split(' ');
  const phone = (firebaseUser as any).phoneNumber;

  // generate a new random UUID string
  const newId = uuidv4();

  const body = {
    id: newId,
    username: displayName
      ? displayName.replace(/\s+/g, '_').toLowerCase()
      : `user_${newId.slice(0, 6)}`,
    firstname: firstname || 'New',
    lastname: lastname || 'User',
    email: firebaseUser.email || '',
    profilePic: firebaseUser.photoURL || '',
    ...(phone && /^\+\d{1,15}$/.test(phone) && { phoneNumber: phone }),
  };

  console.log('[createUserInBackend] Final request body:', body);

  const response = await secureFetch(`${BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[createUserInBackend] Server response:', errorText);
    throw new Error(`Failed to create user: ${response.status}`);
  }

  return response.json();
}
