export interface AcceptFriendRequestResponseDto {
  following_id: string;
  followed_id: string;
  requested_at: string;       // ISO string from backend JSON
  is_pending: boolean;        // should be false now
  accepted_at: string | null; // should have a timestamp now
}
