import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './domain/friend.entity';
import { User } from '../user/domain/user.entity';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { FirebaseAuthModule } from '../firebase/auth/firebase-auth.module';
import { FRIEND_REPOSITORY_TOKEN } from '../common/constants/provider-tokens';
import { TypeOrmFriendRepository } from './infrastructure/friend-repository.impl';

@Module({
  imports: [
    TypeOrmModule.forFeature([Follow, User]),
    FirebaseAuthModule, 
  ],
  controllers: [FriendController], 
  providers: [
    FriendService,
    { provide: FRIEND_REPOSITORY_TOKEN, useClass: TypeOrmFriendRepository },
  ],
})
export class FriendsModule {}
