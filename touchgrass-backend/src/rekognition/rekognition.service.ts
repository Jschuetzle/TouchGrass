import { Injectable, Inject } from '@nestjs/common';
import { RekognitionClient, CreateCollectionCommand, DeleteCollectionCommand, DetectFacesCommand, RekognitionServiceException, DetectFacesCommandOutput } from '@aws-sdk/client-rekognition';
import { REKOGNITION_PROVIDER_TOKEN_NAME } from '../common/constants';
import { RekognitionServiceError } from './rekognition-service.error';

@Injectable()
export class RekognitionService {
    constructor(@Inject(REKOGNITION_PROVIDER_TOKEN_NAME) private readonly rekognitionClient: RekognitionClient) {}

    async createCollection(collection_id: string) {
        const command = new CreateCollectionCommand({
            CollectionId: collection_id,
        });

        try {
            const resp = await this.rekognitionClient.send(command);
        } catch (err) {
            console.error(`Error creating collection: ${JSON.stringify(err, null, 2)}`);
        }   
    }

    async deleteCollection(collection_id: string) {
        const command = new DeleteCollectionCommand({
            CollectionId: collection_id,
        });

        try {
            const resp = await this.rekognitionClient.send(command);
        } catch (err) {
            console.error(`Error deleting collection: ${JSON.stringify(err, null, 2)}`);
        }   
    }

    async detectFaces(photo: Express.Multer.File): Promise<DetectFacesCommandOutput> {
        const command = new DetectFacesCommand({
            Attributes: [
                "DEFAULT",
                "EYES_OPEN",
                "SUNGLASSES",
                "FACE_OCCLUDED",
            ],
            Image: {
                Bytes: photo.buffer,
            }
        });

        try {
            return await this.rekognitionClient.send(command);
        } 
        catch (err) {
            const rekognitionErr = err as RekognitionServiceException;
            const statusCode = rekognitionErr.$metadata.httpStatusCode ?? 0;

            if (statusCode === 400) {
                throw new RekognitionServiceError(
                    "Server is doing something wrong when communicating with Rekognition",
                    rekognitionErr,
                    statusCode
                );
            }

            /*
            else if (statusCode === 500) {
                // eventually, I should write defensive code that handles a 500-level response from AWS (bc not our fault)
                // i.e. retries
            }
            */
           throw err;
        }
    }
}

