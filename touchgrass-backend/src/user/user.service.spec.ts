import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Follow } from '../friends/friend.entity';
import { FIREBASE_PROVIDER_TOKEN_NAME } from '../common/constants';

jest.setTimeout(15000);

describe('UserService', () => {
  let service: UserService;
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
        TypeOrmModule.forFeature([User]),
      ],
			controllers: [UserController],
      providers: [
				UserService,
				{
					provide: FIREBASE_PROVIDER_TOKEN_NAME,
					useValue: {},
				},
			],
    }).compile();

    service = module.get<UserService>(UserService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and search users correctly', async () => {
    const usersToCreate = [
      { id: '1', username: 'abhi' },
      { id: '2', username: 'abhishek' },
      { id: '3', username: 'john' },
      { id: '4', username: 'jo' },
    ];

    for (const userData of usersToCreate) {
      await service.create(userData as any);
    }

    const exactMatch = await service.searchUsers('abhi');
    expect(exactMatch[0].username).toBe('abhi');

    const partialMatch = await service.searchUsers('jo');
    const usernames = partialMatch.map(u => u.username);
    expect(usernames).toContain('john');
    expect(usernames).toContain('jo');
  });

  it('should return empty array if no user matches', async () => {
    const results = await service.searchUsers('nonexistentuser');
    expect(results).toEqual([]);
  });
});
