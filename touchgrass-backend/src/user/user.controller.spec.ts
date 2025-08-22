import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Follow } from '../friends/friend.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { FIREBASE_PROVIDER_TOKEN_NAME } from '../common/constants';

jest.setTimeout(15000);

describe('UserController', () => {
  let controller: UserController;
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
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) 
      .compile();

    controller = module.get<UserController>(UserController);
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
