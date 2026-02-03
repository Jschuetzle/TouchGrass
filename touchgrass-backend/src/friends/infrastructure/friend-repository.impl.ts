// src/friend/infrastructure/typeorm-friend.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { FriendRepository } from '../domain/friend-repository.interface';
import { Follow } from '../domain/friend.entity';
import { User } from '../../user/domain/user.entity';
import { CreateFollowProps } from '../domain/types/create-follow-props';

@Injectable()
export class TypeOrmFriendRepository implements FriendRepository {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepo: Repository<Follow>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  createFollowEntity(props: CreateFollowProps): Follow {
    return this.followRepo.create({
      ...props,
      requested_at: props.requested_at ?? new Date(),
      accepted_at: props.accepted_at ?? null,
    });
  }

  async insertEntity(follow: Follow): Promise<void> {
    await this.followRepo.insert(follow);
  }

  async saveEntity(follow: Follow): Promise<Follow> {
    return this.followRepo.save(follow);
  }

  async deleteEntity(
    criteria: Partial<Follow> | Array<Partial<Follow>>,
  ): Promise<void> {
    await this.followRepo.delete(criteria as any);
  }

  async getUserIdByUsername(username: string): Promise<string | null> {
    const user = await this.userRepo.findOne({
      select: { id: true },
      where: { username },
    });

    return user?.id ?? null;
  }

  async getUsernameByUserId(userId: string): Promise<string | null>{
    const user = await this.userRepo.findOne({
      select :{ username: true},
      where : { id: userId },
    });

    return user?.username ?? null;
  }

  async getFollowRelation(
    followingId: string,
    followedId: string,
    isPending?: boolean,
  ): Promise<Follow | null> {
    const where: Record<string, any> = {
      following_id: followingId,
      followed_id: followedId,
    };

    if (typeof isPending === 'boolean') {
      where.is_pending = isPending;
    }

    return this.followRepo.findOneBy(where);
  }

  async getFriendRelationsForUser(userId: string): Promise<Follow[]> {
    return this.followRepo.find({
      where: [
        { followed_id: userId, is_pending: false },
        { following_id: userId, is_pending: false },
      ],
      relations: ['following', 'followed'],
    });
  }

  async getPendingRequestsForUser(userId: string): Promise<Follow[]> {
    return this.followRepo.find({
      where: { followed_id: userId, is_pending: true },
      relations: ['following'],
    });
  }

  async usersExist(userIds: string[]): Promise<boolean> {
    const users = await this.userRepo.find({
      select: { id: true },
      where: { id: In(userIds) },
    });

    return users.length === userIds.length;
  }
}
