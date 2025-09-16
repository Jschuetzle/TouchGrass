import { Test, TestingModule } from '@nestjs/testing';
import { RekognitionService } from './rekognition.service';
import { CreateCollectionResponse, DeleteCollectionCommand, DeleteCollectionResponse, ListCollectionsCommand, RekognitionClient } from '@aws-sdk/client-rekognition';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { REKOGNITION_PROVIDER_TOKEN_NAME } from '../common/constants';

describe('RekognitionService', () => {
  let rekognitionService: RekognitionService;
  let mockRekognitionClient: DeepMocked<RekognitionClient>;

  let createCollectionTestResponse: CreateCollectionResponse;
  let deleteCollectionTestResponse: DeleteCollectionResponse;
  let collectionIdTest: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RekognitionService,
        {
          provide: REKOGNITION_PROVIDER_TOKEN_NAME, useValue: createMock<RekognitionClient>({}, { strict: true })
        }
      ],
    })
    .compile();

    rekognitionService = module.get<RekognitionService>(RekognitionService);
    mockRekognitionClient = module.get<DeepMocked<RekognitionClient>>(REKOGNITION_PROVIDER_TOKEN_NAME);

    createCollectionTestResponse = {
      CollectionArn: "mockedCollectionArn",
      FaceModelVersion: "mockedFaceModelVersion",
      StatusCode: 200,
    }
    deleteCollectionTestResponse = {
      StatusCode: 200,
    }
    collectionIdTest = 'testId';
  });

  it('should be defined', () => {
    expect(rekognitionService).toBeDefined();
  });

  it('should create collection', async () => {
    (mockRekognitionClient.send as jest.Mock).mockResolvedValue(createCollectionTestResponse);

    await rekognitionService.createCollection(collectionIdTest);

    expect(mockRekognitionClient.send).toHaveBeenCalledTimes(1);
  });

  it('should delete collection', async () => {
    (mockRekognitionClient.send as jest.Mock).mockResolvedValue(deleteCollectionTestResponse);

    await rekognitionService.deleteCollection(collectionIdTest);

    expect(mockRekognitionClient.send).toHaveBeenCalledTimes(1);
  });
});
