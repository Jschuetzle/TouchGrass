import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { FirebaseApplication } from '../../common/types';
import { FIREBASE_PROVIDER_TOKEN_NAME } from '../../common/constants';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { FirebaseAuthService } from './firebase-auth.service';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let mockFirebaseAuthService: DeepMocked<FirebaseAuthService>;
  let mockExecutionContext: DeepMocked<ExecutionContext>;

  let testHttpRequestNoAuthHeader: Request;
  let testHttpRequestBasicAuthScheme: Request;
  let testHttpRequestValidAuthorization: Request;
  let testDecodedIdToken: DecodedIdToken;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
      ],
    })
      .useMocker(createMock)
      .compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
    mockFirebaseAuthService = module.get<DeepMocked<FirebaseAuthService>>(FirebaseAuthService);
    mockExecutionContext = createMock<ExecutionContext>();

    testHttpRequestNoAuthHeader = {
      headers: {
        // no authorization header
      }
    } as unknown as Request;

    testHttpRequestBasicAuthScheme = {
      headers: {
        authorization: 'Basic some-actual-token',
      }
    } as unknown as Request;

    testHttpRequestValidAuthorization = {
      headers: {
        authorization: 'Bearer some-actual-token',
      }
    } as unknown as Request;


    testDecodedIdToken = {
      aud: '',
      auth_time: 0,
      exp: 0,
      iat: 0,
      iss: 0,
      sub: '',
      uid: '',
      firebase: {
        identities: {},
        sign_in_provider: '',

      },
    } as unknown as DecodedIdToken;
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });


  it("should return decodedIdToken when valid authorization header value presented", async () => {
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue(testHttpRequestValidAuthorization);
    mockFirebaseAuthService.verifyIdToken.mockResolvedValue(testDecodedIdToken);

    expect(guard.canActivate(mockExecutionContext)).resolves.toBe(true);
    expect(mockFirebaseAuthService.verifyIdToken).toHaveBeenCalledTimes(1);
  });


  it('should return 401 if token is rejected by firebase', async () => {
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue(testHttpRequestValidAuthorization);
    mockFirebaseAuthService.verifyIdToken.mockRejectedValue(new Error());

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    expect(mockFirebaseAuthService.verifyIdToken).toHaveBeenCalledTimes(1);
  });


  it('should return 401 if no authorization field present in http req', async () => {
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue(testHttpRequestNoAuthHeader);

    expect(guard.canActivate(mockExecutionContext)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockFirebaseAuthService.verifyIdToken).toHaveBeenCalledTimes(0);
  });


  it("should return 401 if authorization scheme is not 'Bearer'", async () => {
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue(testHttpRequestBasicAuthScheme);

    expect(guard.canActivate(mockExecutionContext)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockFirebaseAuthService.verifyIdToken).toHaveBeenCalledTimes(0);
  });
});