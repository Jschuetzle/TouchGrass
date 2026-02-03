// src/friend/friend.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';

import { FRIEND_REPOSITORY_TOKEN } from '../common/constants/provider-tokens';
import { FriendRepository } from './domain/friend-repository.interface';
import { GetFriendListDto } from './dto/get-friend-list.dto';
import { FriendDto } from './dto/friend.dto';
import { AcceptFriendRequestResponseDto } from './dto/accept-friend-request.dto';
import { FollowMapper } from './mappers/friend.mappers';

@Injectable()
export class FriendService {
  constructor(
    @Inject(FRIEND_REPOSITORY_TOKEN)
    private readonly friendRepo: FriendRepository,
  ) {}

  private async ensureUsersExist(userIds: string[]): Promise<void> {
    const ok = await this.friendRepo.usersExist(userIds);
    if (!ok) throw new NotFoundException('One or more users do not exist');
  }

  async sendFriendRequest(fromUserId: string, toUsername: string) {
    const toUserId = await this.friendRepo.getUserIdByUsername(toUsername);
    if (!toUserId) throw new NotFoundException('User not found');

    if (fromUserId === toUserId) {
      throw new BadRequestException("Can't friend yourself");
    }

    const exists = await this.friendRepo.getFollowRelation(fromUserId, toUserId);
    if (exists) throw new BadRequestException('Friend request already exists');

    const follow = this.friendRepo.createFollowEntity({
      following_id: fromUserId,
      followed_id: toUserId,
      is_pending: true,
      requested_at: new Date(),
      accepted_at: null,
    });

    return this.friendRepo.saveEntity(follow);
  }

  async acceptFriendRequest(acceptingUserId: string, requesterUsername: string): Promise<AcceptFriendRequestResponseDto>{
    const requesterId = await this.friendRepo.getUserIdByUsername(requesterUsername);
    if (!requesterId) throw new NotFoundException('User not found');

    const request = await this.friendRepo.getFollowRelation(requesterId, acceptingUserId, true);
    if (!request) throw new NotFoundException('No friend request found');

    request.is_pending = false;
    request.accepted_at = new Date();

    const saved = await this.friendRepo.saveEntity(request);

    const acceptingUsername = await this.friendRepo.getUsernameByUserId(acceptingUserId);
    if (!acceptingUsername) throw new NotFoundException('User not found');

    return FollowMapper.toAcceptFriendRequestResponseDto(
      saved,
      requesterUsername,
      acceptingUsername,
    );
  }


  async declineFriendRequest(decliningUserId: string, requesterUsername: string) {
    const requesterId = await this.friendRepo.getUserIdByUsername(requesterUsername);
    if (!requesterId) throw new NotFoundException('User not found');

    await this.friendRepo.deleteEntity({
      following_id: requesterId,
      followed_id: decliningUserId,
      is_pending: true,
    });

    return { success: true };
  }

  async removeFriend(removingUserId: string, removedUsername: string) {
    const removedUserId = await this.friendRepo.getUserIdByUsername(removedUsername);
    if (!removedUserId) throw new NotFoundException('User not found');

    await this.friendRepo.deleteEntity([
      {
        following_id: removingUserId,
        followed_id: removedUserId,
        is_pending: false,
      },
      {
        following_id: removedUserId,
        followed_id: removingUserId,
        is_pending: false,
      },
    ]);

    return { success: true };
  }

  async getFriends(
    userId: string,
    search = '',
    page = 1,
    limit = 10,
  ): Promise<GetFriendListDto> {
    await this.ensureUsersExist([userId]);

    page = Math.max(1, page);
    limit = Math.min(50, Math.max(1, limit));
    const skip = (page - 1) * limit;

    const relations = await this.friendRepo.getFriendRelationsForUser(userId);

    const friends = relations.map(rel =>
      rel.following_id === userId ? rel.followed : rel.following,
    );

    const filtered = friends.filter(friend =>
      friend.username.toLowerCase().includes(search.toLowerCase()),
    );

    const paginated = filtered.slice(skip, skip + limit);

    const results = paginated.map(friend =>
      plainToInstance(
        FriendDto,
        {
          username: friend.username,
          avatarUrl: friend.profile_pic_link,
        },
        { excludeExtraneousValues: true },
      ),
    );

    return plainToInstance(
      GetFriendListDto,
      {
        total: filtered.length,
        page,
        limit,
        results,
      },
      { excludeExtraneousValues: true },
    );
  }

  async getFriendRequests(userId: string) {
    await this.ensureUsersExist([userId]);

    const pending = await this.friendRepo.getPendingRequestsForUser(userId);
    return pending.map(req => req.following);
  }
}
