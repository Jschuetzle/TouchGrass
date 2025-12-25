import { Injectable, Inject } from '@nestjs/common';
import { RekognitionClient, DetectFacesCommand, RekognitionServiceException, DetectFacesCommandOutput, Attribute } from '@aws-sdk/client-rekognition';
import { REKOGNITION_DETECTFACES_DEFAULT_ATTRIBUTES } from '../common/constants/rekognition';
import { REKOGNITION_PROVIDER_TOKEN } from '../common/constants/provider-tokens';
import { RekognitionServiceError } from './rekognition-service.error';

@Injectable()
export class RekognitionService {
    constructor(@Inject(REKOGNITION_PROVIDER_TOKEN) private readonly rekognitionClient: RekognitionClient) {}

    async detectFaces(photo: Express.Multer.File, attributes: Attribute[] = REKOGNITION_DETECTFACES_DEFAULT_ATTRIBUTES): Promise<DetectFacesCommandOutput> {
        const command = new DetectFacesCommand({
            Attributes: attributes,
            Image: {
                Bytes: photo.buffer,
            }
        });

        try {
            return await this.rekognitionClient.send(command);
        } 
        catch (err) {
            const rekognitionError = err as RekognitionServiceException;
            const statusCode = rekognitionError.$metadata.httpStatusCode;

            throw new RekognitionServiceError(
                `Failed to detectFaces in Rekognition${statusCode ? `: ${statusCode}` : ''}`,
                rekognitionError,
                statusCode
            );
        }
    }
}

