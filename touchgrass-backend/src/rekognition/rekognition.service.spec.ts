import { Test, TestingModule } from '@nestjs/testing';
import { RekognitionService } from './rekognition.service';
import { CreateCollectionCommand, DeleteCollectionCommand, ListCollectionsCommand } from '@aws-sdk/client-rekognition';

describe('RekognitionService', () => {
  let service: RekognitionService;
  let mockClient: { send: jest.Mock }

  beforeEach(async () => {
    mockClient = {
      send: jest.fn(),
    };
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RekognitionService,
        {
          provide: 'REKOGNITION_CLIENT',
          useValue: mockClient
        }
      ],
    }).compile();

    service = module.get<RekognitionService>(RekognitionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create collection', async () => {
    // just example data
    mockClient.send.mockResolvedValue(mockClient.send.mockResolvedValue({
      CollectionArn: 'arn:aws:rekognition:us-west-2:123456789012:collection/test-collection',
      FaceModelVersion: '3.0',
      StatusCode: 200,
    }));

    const result = await service.createCollection('test-collection-id');

    expect(mockClient.send).toHaveBeenCalledWith(expect.any(CreateCollectionCommand));
  });

  it('should delete collection', async () => {
    mockClient.send.mockResolvedValue(mockClient.send.mockResolvedValue({
      StatusCode: 200,
    }));

    const result = await service.deleteCollection('test-collection-id');

    expect(mockClient.send).toHaveBeenCalledWith(expect.any(DeleteCollectionCommand));
  });

  it('should list all currently existing collections', async () => {
    // just example data
    mockClient.send.mockResolvedValue(mockClient.send.mockResolvedValue({
      CollectionIds: ["test-collection-id"],
      FaceModelVersions: ["3.0"],
      NextToken: "",
    }));

    const result = await service.listCollections();

    expect(mockClient.send).toHaveBeenCalledWith(expect.any(ListCollectionsCommand));
  });
});
