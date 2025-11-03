import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3Module } from './s3.module';

describe('S3Service', () => {
  let service: S3Service;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [S3Module]
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
