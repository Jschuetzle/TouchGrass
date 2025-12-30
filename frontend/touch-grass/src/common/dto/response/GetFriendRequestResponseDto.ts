export class GetFriendRequestResponseDto {
  following_id: string;        // sender id
  followed_id: string;         // receiver id
  requested_at: Date;
  is_pending: boolean;
  accepted_at: Date | null;
}

