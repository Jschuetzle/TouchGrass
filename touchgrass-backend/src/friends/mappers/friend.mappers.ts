import { AcceptFriendRequestResponseDto } from '../dto/accept-friend-request.dto';
import { Follow } from '../domain/friend.entity';

export class FollowMapper {
  static toAcceptFriendRequestResponseDto(
    follow: Follow,
    followingUsername: string,
    followedUsername: string,
  ): AcceptFriendRequestResponseDto {
    return {
      following_username: followingUsername,
      followed_username: followedUsername,
      requested_at: follow.requested_at.toISOString(),
      is_pending: follow.is_pending,
      accepted_at: follow.accepted_at ? follow.accepted_at.toISOString() : null,
    };
  }
}
