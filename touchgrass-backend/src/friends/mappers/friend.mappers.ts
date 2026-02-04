import { AcceptFriendRequestResponseDto } from '../dto/accept-friend-request-response.dto';
import { Follow } from '../domain/friend.entity';

export class FollowMapper {
  static toAcceptFriendRequestResponseDto(
    follow: Follow,
  ): AcceptFriendRequestResponseDto {
    return {
      requested_at: follow.requested_at.toISOString(),
      is_pending: follow.is_pending,
      accepted_at: follow.accepted_at ? follow.accepted_at.toISOString() : null,
    };
  }
}
