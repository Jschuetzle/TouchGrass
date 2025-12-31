export type FriendRequestUser = {
  id: string;
  username: string;
};

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