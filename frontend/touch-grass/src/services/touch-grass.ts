// src/services/touch-grass.ts
import Constants from 'expo-constants';
import { secureFetch } from './api';
import { User } from "./auth";
import { BASE_URL } from '../constants/api';
import { CreateUserDto} from '../dto/CreateUserDto'


export async function getDashboard() {
  try {
    console.log(BASE_URL);
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

/**
 * Create a user record in the backend.
 *
 * @param user Data Transfer Object with required identity fields
 * @returns JSON payload returned by the backend (typically the created user)
 * @throws Error with status code and logged response text when backend rejects
 */
export async function createUserInBackend(user: CreateUserDto): Promise<any> {
  const response = await secureFetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    // Surface backend error body for observability before throwing
    const errorText = await response.text();
    console.error("Failed to create user. Response:", errorText);
    throw new Error(`Failed to create user: ${response.status}`);
  }

  // Return the created resource representation
  return await response.json();
}
