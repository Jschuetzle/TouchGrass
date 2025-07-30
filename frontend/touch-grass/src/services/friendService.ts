import { secureFetch } from './api';

export async function fetchFriends(userId: string, page = 1, limit = 50) {
  const res = await secureFetch(
    `/friends/list/${userId}?page=${page}&limit=${limit}`,
    { method: "GET" }
  );

  if (!res.ok) throw new Error('Failed to fetch friends');
  return await res.json();
}

export async function deleteFriend(userId1: string, userId2: string) {
  const res = await secureFetch(`/friends`, {
    method: 'DELETE',
    body: JSON.stringify({ userId1, userId2 }),
  });

  if (!res.ok) throw new Error('Failed to delete friend');
}


export async function searchUsers(query: string, page = 1, limit = 10) {
  const res = await secureFetch(
    `/users/search?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error('Search failed');
  return await res.json();
}

export async function sendFriendRequest(fromId: string, toId: string) {
  const res = await secureFetch(`/friends/request`, {
    method: 'POST',
    body: JSON.stringify({ fromId, toId }),
  });
  if (!res.ok) throw new Error('Friend request failed');
}