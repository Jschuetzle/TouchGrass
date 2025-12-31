import { secureFetch } from '@/services/api';
import { BASE_URL } from '@/common/constants/api';
import { SendFriendRequestResponseDto } from '@/common/dto/response/SendFriendRequestResponseDto';
import { GetFriendRequestResponseDto } from '@/common/dto/response/GetFriendRequestResponseDto';
import { AcceptFriendRequestResponseDto } from "@/common/dto/response/AcceptFriendRequestResponseDto";

export async function SendFriendRequest(sentToUsername: string): Promise<SendFriendRequestResponseDto> {
  const response = await secureFetch(
    `${BASE_URL}/friends/request`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentToUsername }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to send friend request. Response:', errorText);
    throw new Error(`Failed to send friend request: ${response.status}`);
  }

  const data = await response.json();
  return data as SendFriendRequestResponseDto;
}

export async function GetFriendRequests(): Promise<GetFriendRequestResponseDto[]> {
  const response = await secureFetch(
    `${BASE_URL}/friends/requests`, 
    {
      method: 'GET',                 
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to get friend requests. Response:', errorText);
    throw new Error(`Failed to get friend requests: ${response.status}`);
  }

  const data = await response.json();
  return data as GetFriendRequestResponseDto[];
}

export async function AcceptFriendRequest(
  requesterUsername: string
): Promise<AcceptFriendRequestResponseDto> {
  const response = await secureFetch(`${BASE_URL}/friends/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requesterUsername }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to accept friend request. Response:", errorText);
    throw new Error(`Failed to accept friend request: ${response.status}`);
  }

  const data = await response.json();
  return data as AcceptFriendRequestResponseDto;
}

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

export async function GetFriends(
  search: string = "",
  page: number = 1,
  limit: number = 10
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