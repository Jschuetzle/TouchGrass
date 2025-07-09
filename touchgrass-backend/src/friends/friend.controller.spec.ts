import { Test, TestingModule } from '@nestjs/testing';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Follow } from './friend.entity';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';

jest.setTimeout(15000);

describe('FriendController', () => {
  let controller: FriendController;
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
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) 
      .compile();

    controller = module.get<FriendController>(FriendController);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
