export class SendFriendRequestResponseDto {
  following_id: string;        
  followed_id: string;        
  requested_at: Date;
  is_pending: boolean;
  accepted_at: Date | null;
}
