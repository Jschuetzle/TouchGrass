import { secureFetch } from '@/services/api';
import { BASE_URL } from '@/common/constants/api';
import { SendFriendRequestResponseDto } from '@/common/dto/response/SendFriendRequestResponseDto';
import { GetFriendRequestResponseDto } from '@/common/dto/response/GetFriendRequestResponseDto';
import { GetFriendRequestDto } from '@/common/dto/request/GetFriendRequestDto';

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
      // auth header should be added by secureFetch (e.g. Authorization: Bearer <token>)
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
