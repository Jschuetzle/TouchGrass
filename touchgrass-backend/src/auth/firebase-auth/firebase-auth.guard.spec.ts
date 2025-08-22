import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { getAuth } from 'firebase-admin/auth';
import { App } from 'firebase-admin/app';
import { FIREBASE_PROVIDER_TOKEN_NAME } from '../../common/constants';


// we are gonna mock stuff, no need for integration i think. general thought process -  pretend this function exists and do what I tell you it does - don’t actually call Firebase
// Mock only the `getAuth` function from Firebase Admin Auth.
// This prevents real calls to Firebase and lets us control behavior in tests.
jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let mockApp: App; // Mock Firebase App instance, injected into the guard

  beforeEach(async () => {
    // Create a fake Firebase App instance
    mockApp = {} as App;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Mock the firebase provider
        {
          provide: FIREBASE_PROVIDER_TOKEN_NAME,
          useValue: mockApp,
        },
        FirebaseAuthGuard, // Provide the actual guard class for testing
      ],
    }).compile();

    // Get the guard instance to test its behavior
    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
  });

  // Basic sanity check: make sure the guard instance is constructed
  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  // Should throw if no Authorization header is present
  it('should throw UnauthorizedException if no token', async () => {
    // Simulate an HTTP request with no headers
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as unknown as ExecutionContext;

    // Expect the guard to throw UnauthorizedException
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  // Should call verifyIdToken and allow the request if the token is valid
  it('should call verifyIdToken and return true', async () => {
    // Create a fake verifyIdToken function that resolves with a user object
    const mockVerifyIdToken = jest.fn().mockResolvedValue({ uid: 'user123' });

    // Mock getAuth to return our mock verify function
    (getAuth as jest.Mock).mockReturnValue({ verifyIdToken: mockVerifyIdToken });

    // Simulate an HTTP request with a valid Bearer token
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer mock-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    // Expect the guard to allow the request
    await expect(guard.canActivate(ctx)).resolves.toBe(true);

    // And verify that our mock function was called with the correct token
    expect(mockVerifyIdToken).toHaveBeenCalledWith('mock-token');
  });

  // Should throw if the token is invalid (Firebase rejects it)
  it('should throw UnauthorizedException if token is invalid', async () => {
    // Mock verifyIdToken to reject (simulating Firebase throwing an error)
    const mockVerifyIdToken = jest.fn().mockRejectedValue(new Error('Invalid token'));

    // Return the mocked verifyIdToken function
    (getAuth as jest.Mock).mockReturnValue({ verifyIdToken: mockVerifyIdToken });

    // Simulate an HTTP request with a malformed or expired token
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: 'Bearer bad-token',
          },
        }),
      }),
    } as unknown as ExecutionContext;

    // Expect the guard to reject access with an UnauthorizedException
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });
});