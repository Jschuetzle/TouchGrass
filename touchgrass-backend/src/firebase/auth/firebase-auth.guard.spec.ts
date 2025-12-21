import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { DecodedIdToken } from 'firebase-admin/auth';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { FirebaseAuthService } from './firebase-auth.service';
import { Request } from 'express';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let mockFirebaseAuthService: DeepMocked<FirebaseAuthService>;
  let mockExecutionContext: DeepMocked<ExecutionContext>;

  const testHttpRequestNoAuthHeader = createMock<Request>({ headers: {} });
  const testHttpRequestBasicAuthScheme = createMock<Request>({ headers: { authorization: 'Basic token' }});
  const testHttpRequestValidAuthorization = createMock<Request>({ headers: { authorization: 'Bearer token' }});
  const testDecodedIdToken = createMock<DecodedIdToken>();;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
      ],
    })
      .useMocker(createMock)
      .compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
    mockFirebaseAuthService = module.get(FirebaseAuthService);
    mockExecutionContext = createMock<ExecutionContext>();
  });

  beforeEach(async () => {
    jest.resetAllMocks();
  })

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });


  it("should return decodedIdToken when valid authorization header value presented", () => {
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


  it('should return 401 if no authorization field present in http req', () => {
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue(testHttpRequestNoAuthHeader);

    expect(guard.canActivate(mockExecutionContext)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockFirebaseAuthService.verifyIdToken).toHaveBeenCalledTimes(0);
  });


  it("should return 401 if authorization scheme is not 'Bearer'", () => {
    mockExecutionContext.switchToHttp().getRequest.mockReturnValue(testHttpRequestBasicAuthScheme);

    expect(guard.canActivate(mockExecutionContext)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(mockFirebaseAuthService.verifyIdToken).toHaveBeenCalledTimes(0);
  });
});