// src/services/touch-grass.ts
// Service layer for user-related network calls against the app backend.
// Uses a secureFetch wrapper (adds auth headers, token refresh, etc.) and Expo constants for base URL discovery.

import Constants from "expo-constants";
import { secureFetch } from "./api";
import { User } from "./auth";

// Construct the backend base URL from an Expo runtime constant.
// Example: if extra.backendIP === "192.168.1.10:3000" => http://192.168.1.10:3000
const BASE_URL = `http://${Constants.expoConfig.extra.backendIP}`;

/**
 * Check if a Firebase-authenticated user exists in the backend.
 *
 * @param uid Firebase Auth UID
 * @returns boolean flag indicating user existence
 * @throws Error when the HTTP response is not ok (non-2xx)
 */
export async function checkUserExists(uid: string): Promise<boolean> {
  // GET /users/exists/:uid expects a JSON payload like { exists: boolean }
  const response = await secureFetch(`${BASE_URL}/users/exists/${uid}`, {
    method: "GET",
  });

  if (!response.ok) {
    // Normalize failure with an actionable message
    throw new Error(`Failed to check user existence: ${response.status}`);
  }

  // Parse and return the existence flag
  const json = await response.json();
  return json.exists;
}

/**
 * Fetch a single user's existence payload by UID.
 *
 * Note: This calls the same `/users/exists/:uid` endpoint and returns its JSON body.
 * If the backend returns only an existence flag, the shape will mirror that.
 *
 * @param uid Firebase Auth UID
 * @returns JSON returned by the endpoint
 * @throws Error when the request fails
 */
export async function getUser(uid: string) {
  try {
    const response = await secureFetch(`${BASE_URL}/users/exists/${uid}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Return the raw JSON payload from the backend
    return await response.json();
  } catch (err) {
    console.error("Error fetching /user:", err);
    throw err;
  }
}

/**
 * Fetch all users from the backend.
 *
 * @returns Array (or collection) of users as returned by the backend
 * @throws Error when the request fails
 */
export async function getUsers() {
  try {
    const response = await secureFetch(`${BASE_URL}/users`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    // Return the list of users
    return await response.json();
  } catch (err) {
    console.error("Error fetching /users:", err);
    throw err;
  }
}

// DTO for creating a user in the backend. Optional fields are marked with '?'.
export type CreateUserDto = {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  profile_pic?: string;
  phone_number?: string; // E.164 string if present, e.g. "+15551234567"
};

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

/**
 * Build a CreateUserDto from a Firebase Auth user and create it in the backend.
 *
 * - Derives username from displayName (spaces -> underscores, lowercased),
 *   or falls back to `user_<uidPrefix>`.
 * - Splits displayName once to get firstname/lastname defaults.
 * - Copies email and photoURL when available.
 * - Includes phone_number only when it matches a strict E.164 pattern.
 *
 * @param firebaseUser Firebase Auth user object
 * @returns JSON payload from backend user creation
 */
export async function createUserFromFirebase(firebaseUser: User): Promise<any> {
  // Normalize display name and derive name parts
  const displayName = firebaseUser.displayName?.trim() || "";
  const [firstname, lastname] = displayName.split(" ");

  // Firebase User type may hold phoneNumber; cast for access
  const phone = (firebaseUser as any).phoneNumber as string | undefined;
  const newId = firebaseUser.uid;

  // Assemble the DTO with safe fallbacks
  const body: CreateUserDto = {
    id: newId,
    username: displayName
      ? displayName.replace(/\s+/g, "_").toLowerCase()
      : `user_${newId.slice(0, 6)}`,
    firstname: firstname || "New",
    lastname: lastname || "User",
    email: firebaseUser.email || "",
    profile_pic: firebaseUser.photoURL || "",
    // Conditionally include phone_number only when valid E.164
    ...(phone && /^\+\d{1,15}$/.test(phone) && { phone_number: phone }),
  };

  // Delegate to the POST helper
  return await createUserInBackend(body);
}
