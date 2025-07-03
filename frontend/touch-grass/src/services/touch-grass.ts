// services/touch-grass.ts

const BASE_URL = 'http://18.191.181.59';

export async function getUsers() {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
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
