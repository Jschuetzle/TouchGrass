import { Test, TestingModule } from '@nestjs/testing';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Follow } from './friend.entity';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { createMock } from '@golevelup/ts-jest';

jest.setTimeout(15000);

describe('FriendController', () => {
  let friendController: FriendController;
  let friendService: FriendService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendController],
      providers: [
        {
          provide: FriendService, useValue: createMock<FriendService>({}, { strict: true })
        }
      ],
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: () => true }) 
      .compile();

    friendController = module.get<FriendController>(FriendController);
    friendService = module.get<FriendService>(FriendService);
  });


  it('controller and dependencies should be defined', () => {
    expect(friendController).toBeDefined();
    expect(friendService).toBeDefined();
  });
});
