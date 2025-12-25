import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthService } from './firebase-auth.service';
import { FIREBASE_PROVIDER_TOKEN } from '../../common/constants/provider-tokens';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { FirebaseApplication } from 'src/common/types';
import { Auth, DecodedIdToken, getAuth } from 'firebase-admin/auth';

// stubbing out the 'getAuth' call in constructor of FirebaseAuthService requires mocking of the module which
// 'getAuth' resides. We still want to use some of the classes from this module for mocks & test values
// (e.g. Auth and DecodedIdToken), so we have to require the entire module, and stub out just getAuth
jest.mock('firebase-admin/auth', () => {
  const actual = jest.requireActual('firebase-admin/auth');
  return {
    ...actual,
    getAuth: jest.fn(),
  }
});

describe('FirebaseAuth', () => {
  let firebaseAuthService: FirebaseAuthService;
  let mockFirebaseApplication: DeepMocked<FirebaseApplication>;

  const getAuthMock = getAuth as jest.MockedFunction<typeof getAuth>;
  const mockAuth = createMock<Auth>();

  const testIdToken = "test token";
  const testDecodedIdToken = createMock<DecodedIdToken>();

  beforeAll(async () => {
    getAuthMock.mockReturnValue(mockAuth);
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthService,
        {
          provide: FIREBASE_PROVIDER_TOKEN, useValue: createMock<FirebaseApplication>(),
        }
      ],
    }).compile();

    firebaseAuthService = module.get(FirebaseAuthService);
    mockFirebaseApplication = module.get(FIREBASE_PROVIDER_TOKEN);
  });

  afterEach(() => {
    jest.resetAllMocks();
  })

  it('should be defined', () => {
    expect(firebaseAuthService).toBeDefined();
    expect(getAuthMock).toHaveBeenCalledTimes(1);

    // Notice, this test needs to be first in the suite. The constructor of FirebaseAuthService is called
    // when the testing module is compiled. Therefore, if we reset the mocks between that compile and this test, then
    // the call history is cleared. Notice, we have to reset mocks AFTER tests (afterEach instead of beforeEach) due to this
  });

  it('should call Firebase API only once', () => {
    mockAuth.verifyIdToken.mockResolvedValue(testDecodedIdToken);

    expect(firebaseAuthService.verifyIdToken(testIdToken)).resolves.toBe(testDecodedIdToken);
    expect(mockAuth.verifyIdToken).toHaveBeenCalledTimes(1);
  });
});
