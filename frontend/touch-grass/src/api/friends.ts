import { secureFetch } from '@/services/api';
import { BASE_URL } from '@/common/constants/api';
import { SendFriendRequestResponseDto } from '@/common/dto/response/SendFriendRequestResponseDto';

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
