export interface AcceptFriendRequestResponseDto {
  following_id: string;
  followed_id: string;
  requested_at: string;      
  is_pending: boolean;       
  accepted_at: string | null; 
}
