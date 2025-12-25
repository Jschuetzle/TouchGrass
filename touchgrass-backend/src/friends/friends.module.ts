import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { Follow } from './friend.entity';
import { User } from '../user/domain/user.entity';
import { FirebaseAuthModule } from '../firebase/auth/firebase-auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, User]), FirebaseAuthModule],
  providers: [FriendService],
  controllers: [FriendController],
  exports: [FriendService],
})
export class FriendsModule {}