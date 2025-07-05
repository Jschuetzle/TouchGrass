// services/touch-grass.ts
import Constants from 'expo-constants';

const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}`;

export async function getUsers() {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: "GET",
      headers: {
        Accept: '*/*',
      },
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
