// services/user.ts
import { User } from './auth';
import { getDashboard, createUserInBackend, CreateUserDto } from './touch-grass';

type DashboardResponse = { status: string }; // minimal shape used here

const isE164 = (phone: string) => /^\d{1,15}$/.test(phone);

/**
 * Build the default payload for creating a new user in your backend.
 * Pure/predictable: only depends on the Firebase user.
 */
export function buildNewUserPayload(firebaseUser: User): CreateUserDto {
  const displayName = firebaseUser.displayName?.trim() || firebaseUser.providerData[0]?.displayName?.trim() ||'';
  const nameParts = displayName.split(/\s+/).filter(Boolean);
  const firstname = nameParts[0] ?? 'New';
  const lastname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'User';

  // Fallback username: from displayName -> snake; else from email prefix; else 'new_user'
  const usernameFromDisplay =
    displayName ? displayName.replace(/\s+/g, '_').toLowerCase() : null;
  const usernameFromEmail = firebaseUser.email
    ? firebaseUser.email.split('@')[0]
    : null;
  const username = usernameFromDisplay || usernameFromEmail || 'new_user';

  const payload: CreateUserDto = {
    id: firebaseUser.uid,
    username,
    firstname,
    lastname,
    email: firebaseUser.email ?? '',
    profile_pic: firebaseUser.photoURL ?? '',
  };

  const phone = (firebaseUser as any).phoneNumber as string | undefined;
  if (phone && isE164(phone)) {
    (payload as any).phone_number = phone;
  }

  return payload;
}

/**
 * Ask the backend whether this is a new user; if so, return a suggested payload.
 * Returns null if the user already exists or if the backend doesn't require onboarding.
 */
export async function getNewUserPayloadIfNeeded(
  firebaseUser: User
): Promise<CreateUserDto | null> {
  const dashboard = (await getDashboard()) as DashboardResponse;
  if (dashboard.status === 'NEW_USER') {
    return buildNewUserPayload(firebaseUser);
  }
  return null;
}

/**
 * Simple passthrough to keep user-related side effects in one place.
 * Useful if you later add analytics, retries, or error mapping.
 */
export async function createUser(payload: CreateUserDto): Promise<void> {
  await createUserInBackend(payload);
}
