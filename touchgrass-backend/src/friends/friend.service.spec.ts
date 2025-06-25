import { Test, TestingModule } from '@nestjs/testing';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Follow } from './friend.entity';
import { ConfigModule } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';

jest.setTimeout(15000); // Allow time for DB container to be ready

describe('FriendService + FriendController', () => {
  let service: FriendService;
  let controller: FriendController;
  let userRepo: Repository<User>;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
          isGlobal: true,
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.TYPEORM_HOST,
          port: parseInt(process.env.TYPEORM_PORT || '5432', 10),
          username: process.env.TYPEORM_USERNAME,
          password: process.env.TYPEORM_PASSWORD,
          database: process.env.TYPEORM_DATABASE,
          entities: [User, Follow],
          synchronize: true,
          dropSchema: true,
        }),
        TypeOrmModule.forFeature([User, Follow]),
      ],
      controllers: [FriendController],
      providers: [FriendService],
    }).compile();

    service = module.get<FriendService>(FriendService);
    controller = module.get<FriendController>(FriendController);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);

    await userRepo.save([
      {
        id: 'uid_abhi',
        username: 'abhi',
        firstname: 'Abhi',
        lastname: 'K',
        email: 'abhi@example.com',
        password: 'changeme123',
        created_at: new Date(),
        daily_upload_count: 0,
        profile_pic: 'abhi.png',
        phone_number: '1234567890',
      },
      {
        id: 'uid_ryan',
        username: 'ryan',
        firstname: 'Ryan',
        lastname: 'J',
        email: 'ryan@example.com',
        password: 'changeme123',
        created_at: new Date(),
        daily_upload_count: 0,
        profile_pic: 'ryan.png',
        phone_number: '9876543210',
      },
    ]);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should define the controller and service', () => {
    expect(service).toBeDefined();
    expect(controller).toBeDefined();
  });

  it('should send a friend request', async () => {
    await service.sendFriendRequest('uid_abhi', 'uid_ryan');
    const ryanIncoming = await service.getFriendRequests('uid_ryan');
    expect(ryanIncoming.length).toBe(1);
  });

  it('should decline the request', async () => {
    await service.declineFriendRequest('uid_ryan', 'uid_abhi');
    const ryanIncoming = await service.getFriendRequests('uid_ryan');
    expect(ryanIncoming.length).toBe(0);
  });

  it('should allow resending the request and accept it', async () => {
    await service.sendFriendRequest('uid_abhi', 'uid_ryan');
    await service.acceptFriendRequest('uid_ryan', 'uid_abhi');
    const abhiFriends = await service.getFriends('uid_abhi', '', 1, 10);
    expect(abhiFriends.results.length).toBe(1);
  });

  it('should remove the friend', async () => {
    await service.removeFriend('uid_abhi', 'uid_ryan');
    const abhiFriends = await service.getFriends('uid_abhi', '', 1, 10);
    expect(abhiFriends.results.length).toBe(0);
  });
});