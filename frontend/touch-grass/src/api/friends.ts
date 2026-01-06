import { secureFetch } from "@/services/api";
import { BASE_URL } from "@/common/constants/api";
import { plainToInstance } from "class-transformer";
import { SendFriendRequestDto } from "@/common/dto/request/SendFriendRequestDto";
import { SendFriendRequestResponseDto } from "@/common/dto/response/SendFriendRequestResponsedto";
import { GetFriendRequestsResponseDto } from "@/common/dto/response/GetFriendRequestsResponseDto";
import { AcceptFriendRequestResponseDto } from "@/common/dto/response/AcceptFriendRequestResponseDto";
import { GetFriendsResponseDto } from "@/common/dto/response/GetFriendsResponseDto";
import { instanceToPlain } from "class-transformer";
import { AcceptFriendRequestDto } from "@/common/dto/request/AcceptFriendRequestDto";

/**
 * Sends a friend request to another user by username
 */
export async function SendFriendRequest(
  sentToUsername: string
): Promise<SendFriendRequestResponseDto> {

  const dto = new SendFriendRequestDto();
  dto.sentToUsername = sentToUsername;

  const body = instanceToPlain(dto);

  const response = await secureFetch(`${BASE_URL}/friends/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to send friend request. Response:", errorText);
    throw new Error(`Failed to send friend request: ${response.status}`);
  }

  const data = await response.json();

  return plainToInstance(SendFriendRequestResponseDto, data, {
    excludeExtraneousValues: true,
  });
}

/**
 * Retrieves all incoming friend requests for the current user
 */
export async function GetFriendRequests(): Promise<GetFriendRequestsResponseDto> {
  const response = await secureFetch(`${BASE_URL}/friends/requests`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to get friend requests. Response:", errorText);
    throw new Error(`Failed to get friend requests: ${response.status}`);
  }

  const data = await response.json(); 

  const dto = plainToInstance(
    GetFriendRequestsResponseDto,
    { requests: data },            
    { excludeExtraneousValues: true }
  );

  return dto;
}

/**
 * Accepts a pending friend request from a specific user
 */
export async function AcceptFriendRequest(
  requesterUsername: string
): Promise<AcceptFriendRequestResponseDto> {
  const requestDto = plainToInstance(
    AcceptFriendRequestDto,
    { requesterUsername },
    { excludeExtraneousValues: true }
  );

  const response = await secureFetch(`${BASE_URL}/friends/accept`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(instanceToPlain(requestDto)),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to accept friend request. Response:", errorText);
    throw new Error(`Failed to accept friend request: ${response.status}`);
  }

  const data = await response.json();

  return plainToInstance(AcceptFriendRequestResponseDto, data, {
    excludeExtraneousValues: true,
  });
}

/**
 * Retrieves a paginated list of friends with optional search
 */
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
  return plainToInstance(GetFriendsResponseDto, data, {
    excludeExtraneousValues: true,
  });
}

/**
 * Retrieves a larger batch of friends (useful for dropdowns or full lists)
 */
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
  return plainToInstance(GetFriendsResponseDto, data, {
    excludeExtraneousValues: true,
  });
}

/**
 * Removes a friend from the user's friend list
 */
export async function deleteFriend(
  removedUsername: string
): Promise<void> {
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
