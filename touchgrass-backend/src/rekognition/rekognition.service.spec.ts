import { Test, TestingModule } from '@nestjs/testing';
import { RekognitionService } from './rekognition.service';
import { DetectFacesCommand, DetectFacesCommandOutput, RekognitionClient, RekognitionServiceException } from '@aws-sdk/client-rekognition';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { REKOGNITION_DETECTFACES_DEFAULT_ATTRIBUTES, REKOGNITION_PROFILEPIC_VALIDATION_ATTRIBUTES } from '../common/constants/rekognition';
import { REKOGNITION_PROVIDER_TOKEN } from '../common/constants/provider-tokens';

describe('RekognitionService', () => {
  let rekognitionService: RekognitionService;
  let mockRekognitionClient: DeepMocked<RekognitionClient>;
  let sendMock: jest.Mock;

  const testBuffer = createMock<Buffer>();
  const testPhoto = createMock<Express.Multer.File>({
    buffer: testBuffer,
  });
  const testDetectFacesCommandOutput = createMock<DetectFacesCommandOutput>();
  
  const testRekognitionServiceException = createMock<RekognitionServiceException>({
    $metadata: {
      httpStatusCode: 500,
    }
  });

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RekognitionService,
        {
          provide: REKOGNITION_PROVIDER_TOKEN, useValue: createMock<RekognitionClient>()
        }
      ],
    })
    .compile();

    rekognitionService = module.get(RekognitionService);
    mockRekognitionClient = module.get(REKOGNITION_PROVIDER_TOKEN);
    sendMock = mockRekognitionClient.send as jest.Mock;
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(rekognitionService).toBeDefined();
  });

  /**
   * 
   * DETECT FACES
   * 
   */
  it('Rekognition API should be called once with correct AWS command while detecting faces', async () => {
    await rekognitionService.detectFaces(testPhoto);

    expect(sendMock).toHaveBeenCalledTimes(1);
    const sentCommand = sendMock.mock.calls[0][0];
    expect(sentCommand).toBeInstanceOf(DetectFacesCommand);
    expect(sentCommand.input.Image.Bytes).toBe(testBuffer);
    expect(sentCommand.input.Attributes).toBe(REKOGNITION_DETECTFACES_DEFAULT_ATTRIBUTES);
  });

  it('should use non-default attributes in AWS command', async () => {
    await rekognitionService.detectFaces(testPhoto, REKOGNITION_PROFILEPIC_VALIDATION_ATTRIBUTES);

    const sentCommand = sendMock.mock.calls[0][0];
    expect(sentCommand.input.Attributes).toBe(REKOGNITION_PROFILEPIC_VALIDATION_ATTRIBUTES);
  });

  it('should return CommandOutput containing face details upon successful facial detection', () => {
    sendMock.mockResolvedValue(testDetectFacesCommandOutput);

    expect(rekognitionService.detectFaces(testPhoto)).resolves.toBe(testDetectFacesCommandOutput);
  });
});
