// src/services/touch-grass.ts
import Constants from 'expo-constants';
import { secureFetch } from './api';

const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}`;

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