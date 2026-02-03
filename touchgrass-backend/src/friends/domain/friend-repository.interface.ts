// src/friend/domain/friend-repository.interface.ts
import { Follow } from '../domain/friend.entity';
import { User } from '../../user/domain/user.entity';
import { CreateFollowProps } from '../domain/types/create-follow-props';

export interface FriendRepository {
  // entity factory
  createFollowEntity(props: CreateFollowProps): Follow;

  // persistence primitives
  insertEntity(follow: Follow): Promise<void>;
  saveEntity(follow: Follow): Promise<Follow>;
  deleteEntity(criteria: Partial<Follow> | Array<Partial<Follow>>): Promise<void>;

  // lookups
  getUserIdByUsername(username: string): Promise<string | null>;
  getUsernameByUserId(userId: string): Promise<string | null>
  getFollowRelation(
    followingId: string,
    followedId: string,
    isPending?: boolean,
  ): Promise<Follow | null>;

  // reads
  getFriendRelationsForUser(userId: string): Promise<Follow[]>;
  getPendingRequestsForUser(userId: string): Promise<Follow[]>;

  // optional guard
  usersExist(userIds: string[]): Promise<boolean>;
}