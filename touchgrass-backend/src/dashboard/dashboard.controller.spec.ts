import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { FirebaseAuthGuard } from '../auth/firebase-auth/firebase-auth.guard';
import { UserService } from '../user/user.service';
import { createMock } from '@golevelup/ts-jest';

describe('DashboardController', () => {
  let controller: DashboardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: UserService, useValue: createMock<UserService>({}, { strict: true })
        }
      ]
    })
    .overrideGuard(FirebaseAuthGuard)
    .useValue({ canActivate: () => true})
    .compile();

    controller = module.get<DashboardController>(DashboardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
