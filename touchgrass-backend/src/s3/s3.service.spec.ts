import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3_PROVIDER_TOKEN_NAME } from '../common/constants';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { GetObjectCommand, PutObjectCommand, PutObjectCommandOutput, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { S3ServiceError } from './s3-service.error';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('S3Service', () => {
  let s3Service: S3Service;
  let mockS3Client: DeepMocked<S3Client>;
  let sendMock: jest.Mock;
  const getSignedUrlMock = getSignedUrl as jest.MockedFunction<typeof getSignedUrl>;

  const testBuffer = createMock<Buffer>();
  const testPhoto = createMock<Express.Multer.File>({
    buffer: testBuffer,
  });
  const testPath = "test path";
  const testPutObjectCommandOutput = createMock<PutObjectCommandOutput>();
  const testS3Exception = createMock<S3ServiceException>({
    $metadata: {
      httpStatusCode: 500,
    }
  });
  const testSignedUrl = 'result of getSignedUrl';
  const getSignedUrlError = new Error("Failure in obtaining signed URL");

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: S3_PROVIDER_TOKEN_NAME, useValue: createMock<S3Client>()
        }
      ]
    }).compile();

    s3Service = module.get(S3Service);
    mockS3Client = module.get(S3_PROVIDER_TOKEN_NAME);

    // mocking of s3Client.send is required here as send is overloaded, and createMock doesn't pick the desired overload
    sendMock = mockS3Client.send as jest.Mock;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('S3Service be defined', () => {
    expect(s3Service).toBeDefined();
  });

  it('should call S3 client once with correct AWS command when putting an object', () => {
    s3Service.putObject(testPhoto, testPath);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sentCommand = sendMock.mock.calls[0][0];
    expect(sentCommand).toBeInstanceOf(PutObjectCommand);
    expect(sentCommand.input.Key).toBe(testPath);
    expect(sentCommand.input.Body).toBe(testBuffer);
  });

  it('should return void upon successfully putting object', () => {
    sendMock.mockResolvedValue(testPutObjectCommandOutput);

    expect(s3Service.putObject(testPhoto, testPath)).resolves.toBeUndefined();
  });

  it('should throw S3ServiceError upon failure of putting object', async () => {
    sendMock.mockRejectedValue(testS3Exception);

    await expect(s3Service.putObject(testPhoto, testPath)).rejects.toThrow(S3ServiceError);
  });

  it('should call AWS signing API once with correct AWS command when getting presigned url', () => {
    s3Service.getPresignedUrl(testPath)

    expect(getSignedUrlMock).toHaveBeenCalledTimes(1);
    const sentCommand = getSignedUrlMock.mock.calls[0][1];
    expect(sentCommand).toBeInstanceOf(GetObjectCommand);
    expect((sentCommand as GetObjectCommand).input.Key).toBe(testPath);
  });

  it('should return signed url upon successful call to getSignedUrl', () => {
    getSignedUrlMock.mockResolvedValue(testSignedUrl);

    expect(s3Service.getPresignedUrl(testPath)).resolves.toBe(testSignedUrl);
  });

  it('should error when a failure in getting signed url occurs', () => {
    getSignedUrlMock.mockRejectedValue(getSignedUrlError);

    expect(s3Service.getPresignedUrl(testPath)).rejects.toThrow(getSignedUrlError);
  });
});
