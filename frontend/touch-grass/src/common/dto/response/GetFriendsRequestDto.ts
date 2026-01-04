import { FriendDto } from '@/common/dto/response/FriendDto';

export class GetFriendsResponseDto {
  total: number;
  page: number;
  limit: number;
  results: FriendDto[];
}