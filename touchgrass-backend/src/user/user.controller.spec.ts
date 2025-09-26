import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';

/*
  GENERAL NOTES

  Controllers are usually quite thin, i.e. they usually just involve making calls to service functions.
  As a result, the service functions should be heavily unit tested, and controller functions should
  only be unit tested if they have any special logic. Currently, this is not the case for the UserController,
  hence the reason no productive unit tests are written here. However, this could change in the future.
  Therefore, this file remains present in the repo.
*/

describe('UserController', () => {
  let controller: UserController;
  let mockService: DeepMocked<UserService>;


  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserService, useValue: createMock<UserService>({}, { strict: true })
        }
      ],
      controllers: [UserController]
    })
      .overrideGuard(FirebaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(UserController);
    mockService = module.get(UserService);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
