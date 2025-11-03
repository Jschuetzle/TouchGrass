import { Test, TestingModule } from '@nestjs/testing';
import { FriendService } from './friend.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Follow } from './friend.entity';
import { Repository, DataSource } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';

jest.setTimeout(15000); // Allow time for DB container to be ready

describe('FriendService + FriendController', () => {
  let friendService: FriendService;
  let userRepo: Repository<User>;
  let followRepo: Repository<Follow>;

  beforeAll(async () => {
    const userRepositoryToken = getRepositoryToken(User);
    const followRepositoryToken = getRepositoryToken(Follow);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
				FriendService,
				{
          provide: userRepositoryToken, useValue: createMock<Repository<User>>({}, { strict: true }) 
        },
        {
          provide: followRepositoryToken, useValue: createMock<Repository<Follow>>({}, { strict: true }) 
        },
			],
    }).compile();

    friendService = module.get<FriendService>(FriendService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    followRepo = module.get<Repository<Follow>>(getRepositoryToken(Follow));

  });

  it('should define service and repos', () => {
    expect(friendService).toBeDefined();
    expect(userRepo).toBeDefined();
    expect(followRepo).toBeDefined();
  });
});
