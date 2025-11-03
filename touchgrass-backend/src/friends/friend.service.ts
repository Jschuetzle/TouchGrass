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

  async sendFriendRequest(fromUserId: string, toUsername: string) {
    const toUser = await this.userRepo.findOneOrFail({
      select: {id: true},
      where: {username: toUsername}
    });

    if (fromUserId === toUser.id) throw new BadRequestException("Can't friend yourself");

    const exists = await this.followRepo.findOneBy({
      following_id: fromUserId,
      followed_id: toUser.id,
    });

    if (exists) throw new BadRequestException('Friend request already exists');

    const follow = this.followRepo.create({
      following_id: fromUserId,
      followed_id: toUser.id,
      is_pending: true,
      requested_at: new Date(),
    });

    return this.followRepo.save(follow);
  }

  async acceptFriendRequest(acceptingUserId: string, requesterUsername: string) {
    const toUser = await this.userRepo.findOneOrFail({
      select: {id: true},
      where: {username: requesterUsername}
    });

    const request = await this.followRepo.findOneBy({
      following_id: toUser.id,
      followed_id: acceptingUserId,
      is_pending: true,
    });

    if (!request) throw new NotFoundException('No friend request found');

    request.is_pending = false;
    request.accepted_at = new Date();

    return this.followRepo.save(request);
  }

  async declineFriendRequest(decliningUserId: string, requesterUsername: string) {
    const toUser = await this.userRepo.findOneOrFail({
      select: {id: true},
      where: {username: requesterUsername}
    });

    return this.followRepo.delete({
      following_id: toUser.id,
      followed_id: decliningUserId,
      is_pending: true
    });
  }

  async removeFriend(removingUserId: string, removedUsername: string) {
    const toUser = await this.userRepo.findOneOrFail({
      select: {id: true},
      where: {username: removedUsername}
    });

    return this.followRepo.delete([
      {
        following_id: removingUserId,
        followed_id: toUser.id,
        is_pending: false,
      },
      {
        following_id: toUser.id,
        followed_id: removingUserId,
        is_pending: false,
      },
    ]);
  }

  async getFriends(userId: string, search = '', page = 1, limit = 10) {
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