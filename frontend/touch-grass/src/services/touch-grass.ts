// src/services/touch-grass.ts
import Constants from 'expo-constants';
import { secureFetch } from './api';

const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}:${Constants.expoConfig.extra.backendPort ?? ''}`;


export async function getDashboard() {
  try {
    const response = await secureFetch(`${BASE_URL}/dashboard`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Error fetching /dashboard:', err);
    throw err;
  }
}
