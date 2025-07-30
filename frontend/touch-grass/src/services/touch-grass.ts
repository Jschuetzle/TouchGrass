// src/services/touch-grass.ts
import Constants from 'expo-constants';
import { secureFetch } from './api';

export async function getUsers() {
  try {
    const response = await secureFetch(`/users`, {
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
