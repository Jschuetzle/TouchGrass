// src/friend/domain/types/create-follow-props.ts
export interface CreateFollowProps {
  following_id: string;   // requester
  followed_id: string;    // target
  is_pending: boolean;
  requested_at?: Date;
  accepted_at?: Date | null;
}
