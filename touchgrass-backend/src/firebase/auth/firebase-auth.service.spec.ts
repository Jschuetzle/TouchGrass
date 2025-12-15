import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthService } from './firebase-auth.service';
import { FIREBASE_PROVIDER_TOKEN_NAME } from '../../common/constants';
import { createMock } from '@golevelup/ts-jest';
import { FirebaseApplication } from 'src/common/types';
import { getAuth } from 'firebase-admin/auth';

// stubbing out the 'getAuth' call in constructor of FirebaseAuthService requires mocking of the environment which
// 'getAuth' resides. Usually, this is a class and we use golevelup's 'createMock'. However, 'getAuth' is a top
// level function, so we must mock the underlying module
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}))

describe('FirebaseAuth', () => {
  let firebaseAuthService: FirebaseAuthService;

  const mockAuth = {
    verifyIdToken: jest.fn(),
  };

  beforeAll(async () => {
    // stub the getAuth call before FirebaseAuthService is instantiated in the testing module initialization
    (getAuth as jest.Mock).mockReturnValue(mockAuth);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthService,
        {
          provide: FIREBASE_PROVIDER_TOKEN_NAME, useValue: createMock<FirebaseApplication>({}, { strict: true }),
        }
      ],
    }).compile();

    firebaseAuthService = module.get<FirebaseAuthService>(FirebaseAuthService);
  });

  it('should be defined', () => {
    expect(firebaseAuthService).toBeDefined();
  });
});
