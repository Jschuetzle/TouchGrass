import { Test, TestingModule } from '@nestjs/testing';
import { S3Service } from './s3.service';
import { S3_PROVIDER_TOKEN } from '../common/constants/provider-tokens';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { DeleteObjectCommandOutput, GetObjectCommand, PutObjectCommand, PutObjectCommandOutput, S3Client, S3ServiceException } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { CloudStorageError } from '../common/errors/cloud-storage.error';
import { PresignedUrlGenerationError } from '../common/errors/presigned-url-generation.error';

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
  const testDeleteObjectCommandOutput = createMock<DeleteObjectCommandOutput>();
  const testS3Exception = createMock<S3ServiceException>({
    $metadata: {
      httpStatusCode: 500,
    },
    message: 'test message',
  });
  const testSignedUrl = 'result of getSignedUrl';
  const getSignedUrlError = new Error("Failure in obtaining signed URL");
  const testExpiration = 5;
  const testContentType = 'test/type';
  const testContentLength = 100;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: S3_PROVIDER_TOKEN, useValue: createMock<S3Client>()
        }
      ]
    }).compile();

    s3Service = module.get(S3Service);
    mockS3Client = module.get(S3_PROVIDER_TOKEN);

    // mocking of s3Client.send is required here as send is overloaded, and createMock doesn't pick the desired overload
    sendMock = mockS3Client.send as jest.Mock;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('S3Service be defined', () => {
    expect(s3Service).toBeDefined();
  });

  it('should call S3 client once with correct AWS command when putting an object', async () => {
    await s3Service.putObject(testPhoto, testPath);

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

  it('should call S3 command only once with correct command when deleting an object ', async () => {
    await s3Service.deleteObject(testPath);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sentCommand = sendMock.mock.calls[0][0];
    expect(sentCommand.input.Key).toBe(testPath);
  });

  it('upon successful deletion of object, should return void', () => {
    sendMock.mockResolvedValue(testDeleteObjectCommandOutput);

    expect(s3Service.deleteObject(testPath)).resolves.toBeUndefined();
  });

  it('upon an error being thrown during AWS deletion API call, should throw CloudStorageError', async () => {
    sendMock.mockImplementation(() => { throw testS3Exception; });

    await expect(s3Service.deleteObject(testPath)).rejects.toThrow(CloudStorageError);
  });

  it('should call AWS signing API once with correct AWS command when generating GET presigned url', async () => {
    await s3Service.generateGetPresignedUrl(testPath);

    expect(getSignedUrlMock).toHaveBeenCalledTimes(1);
    const sentCommand = getSignedUrlMock.mock.calls[0][1];
    expect(sentCommand).toBeInstanceOf(GetObjectCommand);
    expect((sentCommand as GetObjectCommand).input.Key).toBe(testPath);
  });

  it('upon successful call to getSignedUrl, should return signed url', () => {
    getSignedUrlMock.mockResolvedValue(testSignedUrl);

    expect(s3Service.generateGetPresignedUrl(testPath)).resolves.toBe(testSignedUrl);
  });

  it('upon error thrown during AWS signing API, should throw PresignedUrlGenerationError', async () => {
    getSignedUrlMock.mockRejectedValue(getSignedUrlError);

    await expect(s3Service.generateGetPresignedUrl(testPath)).rejects.toThrow(PresignedUrlGenerationError);
  });

  it('when default args provided, should call AWS signing API only once with correct command when generating PUT presigned url', async () => {
    await s3Service.generatePutPresignedUrl(testPath, testExpiration);

    expect(getSignedUrlMock).toHaveBeenCalledTimes(1);

    const sentCommand = getSignedUrlMock.mock.calls[0][1];
    expect(sentCommand).toBeInstanceOf(PutObjectCommand);
    expect((sentCommand as PutObjectCommand).input.Key).toBe(testPath);
    expect((sentCommand as PutObjectCommand).input.ContentType).toBeUndefined();
    expect((sentCommand as PutObjectCommand).input.ContentLength).toBeUndefined();

    const additionalOptions = getSignedUrlMock.mock.calls[0][2];
    expect(additionalOptions?.expiresIn).toBe(testExpiration);
  });

  it('when default+optional args provided, should call AWS signing API only once with correct command when generating PUT presigned url', async () => {
    await s3Service.generatePutPresignedUrl(testPath, testExpiration, testContentType, testContentLength);

    expect(getSignedUrlMock).toHaveBeenCalledTimes(1);

    const sentCommand = getSignedUrlMock.mock.calls[0][1];
    expect((sentCommand as PutObjectCommand).input.ContentType).toBe(testContentType);
    expect((sentCommand as PutObjectCommand).input.ContentLength).toBe(testContentLength);
  });

  it('upon successful call of AWS signing API, should return presigned url', () => {
    getSignedUrlMock.mockResolvedValue(testSignedUrl);

    expect(s3Service.generatePutPresignedUrl(testPath, testExpiration)).resolves.toBe(testSignedUrl);
  });

  it('upon error thrown during AWS signing API, should throw PresignedUrlGenerationError ', async () => {
    getSignedUrlMock.mockRejectedValue(getSignedUrlError);

    await expect(s3Service.generatePutPresignedUrl(testPath, testExpiration)).rejects.toThrow(PresignedUrlGenerationError);
  });
});
