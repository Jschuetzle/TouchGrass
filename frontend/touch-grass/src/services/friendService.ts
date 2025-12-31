import { secureFetch } from './api';
import { BASE_URL } from '@/common/constants/api';

export async function fetchFriends(page = 1, limit = 50) {
  const res = await secureFetch(
    `/friends/list?page=${page}&limit=${limit}`,
    { method: "GET" }
  );

  if (!res.ok) throw new Error('Failed to fetch friends');
  return await res.json();
}


export async function searchUsers(query: string, page = 1, limit = 10) {
  const res = await secureFetch(
    `/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );

  console.log('CONTENT-TYPE:', res.headers.get('content-type'));

  if (!res.ok) throw new Error('Search failed');

  return await res.json();
}


export async function sendFriendRequest(userId: string) {
  const res = await secureFetch(`/friends/request`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Friend request failed');
}

// Types
export interface FriendDto {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface GetFriendsResponseDto {
  total: number;
  page: number;
  limit: number;
  results: FriendDto[];
}

// GET /friends/list
export async function getAllFriends(
  search: string = "",
  page: number = 1,
  limit: number = 50
): Promise<GetFriendsResponseDto> {
  const url = new URL(`${BASE_URL}/friends/list`);
  url.searchParams.append("search", search);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await secureFetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get friends. Response:", errorText);
    throw new Error(`Failed to get friends: ${response.status}`);
  }

  const data = await response.json();
  return data as GetFriendsResponseDto;
}

// DELETE /friends  (body: { removedUsername })
export async function deleteFriend(removedUsername: string): Promise<void> {
  const response = await secureFetch(`${BASE_URL}/friends`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ removedUsername }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to remove friend. Response:", errorText);
    throw new Error(`Failed to remove friend: ${response.status}`);
  }
}
