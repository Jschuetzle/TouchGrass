import { Test, TestingModule } from '@nestjs/testing';
import { FirebaseAuth } from './firebase-auth.service';

describe('FirebaseAuth', () => {
  let provider: FirebaseAuth;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FirebaseAuth],
    }).compile();

    provider = module.get<FirebaseAuth>(FirebaseAuth);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
