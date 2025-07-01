import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from './friend.entity';
import { User } from '../user/user.entity';

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Follow)
    private followRepo: Repository<Follow>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  private async ensureUsersExist(userIds: string[]) {
    const users = await this.userRepo.findByIds(userIds);
    if (users.length !== userIds.length) {
      throw new NotFoundException('One or more users do not exist');
    }
  }

  async sendFriendRequest(fromId: string, toId: string) {
    if (fromId === toId) throw new BadRequestException("Can't friend yourself");

    await this.ensureUsersExist([fromId, toId]);

    const exists = await this.followRepo.findOneBy({
      following_id: fromId,
      followed_id: toId,
    });

    if (exists) throw new BadRequestException('Friend request already exists');

    const follow = this.followRepo.create({
      following_id: fromId,
      followed_id: toId,
      is_pending: true,
    });

    return this.followRepo.save(follow);
  }

  async acceptFriendRequest(currentUserId: string, requesterId: string) {
    await this.ensureUsersExist([currentUserId, requesterId]);

    const request = await this.followRepo.findOneBy({
      following_id: requesterId,
      followed_id: currentUserId,
      is_pending: true,
    });

    if (!request) throw new NotFoundException('No friend request found');

    request.is_pending = false;
    request.accepted_at = new Date();

    return this.followRepo.save(request);
  }

  async declineFriendRequest(currentUserId: string, requesterId: string) {
    await this.ensureUsersExist([currentUserId, requesterId]);

    return this.followRepo.delete({
      following_id: requesterId,
      followed_id: currentUserId,
      is_pending: true,
      requested_at: new Date(),
    });
  }

  async removeFriend(userId1: string, userId2: string) {
    await this.ensureUsersExist([userId1, userId2]);

    return this.followRepo.delete([
      {
        following_id: userId1,
        followed_id: userId2,
        is_pending: false,
      },
      {
        following_id: userId2,
        followed_id: userId1,
        is_pending: false,
      },
    ]);
  }

  async getFriends(userId: string, search = '', page = 1, limit = 10) {
    await this.ensureUsersExist([userId]);

    const skip = (page - 1) * limit;

    const relations = await this.followRepo.find({
      where: [
        { followed_id: userId, is_pending: false },
        { following_id: userId, is_pending: false },
      ],
      relations: ['following', 'followed'],
    });

    const friends = relations.map(rel =>
      rel.following_id === userId ? rel.followed : rel.following,
    );

    const filtered = friends.filter(friend =>
      friend.username.toLowerCase().includes(search.toLowerCase()),
    );

    const paginated = filtered.slice(skip, skip + limit);

    return {
      total: filtered.length,
      page,
      limit,
      results: paginated,
    };
  }

  async getFriendRequests(userId: string) {
    await this.ensureUsersExist([userId]);

    const pending = await this.followRepo.find({
      where: {
        followed_id: userId,
        is_pending: true,
      },
      relations: ['following'],
    });

    return pending.map(req => req.following);
  }
}