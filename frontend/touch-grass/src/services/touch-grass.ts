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


export async function createUserInBackend(firebaseUser: User): Promise<any> {
  const displayName = firebaseUser.displayName?.trim() || '';
  const [firstname, lastname] = displayName.split(' ');

  const fallbackUsername = `user_${firebaseUser.uid.slice(0, 6)}`;

  const phone = (firebaseUser as any).phoneNumber;

  const body: Record<string, any> = {
    id: firebaseUser.uid,
    username: displayName
      ? displayName.replace(/\s+/g, '_').toLowerCase()
      : fallbackUsername,
    firstname: firstname || 'New',
    lastname: lastname || 'User',
    email: firebaseUser.email || '',
    profile_pic: firebaseUser.photoURL || '',
  };

  if (phone && /^\+\d{1,15}$/.test(phone)) {
    body.phone_number = phone;
  }

  console.log('[createUserInBackend] Final request body:', body);

  const response = await secureFetch(`${BASE_URL}/users`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[createUserInBackend] Server response:', errorText);
    throw new Error(`Failed to create user: ${response.status}`);
  }

  return await response.json();
}
