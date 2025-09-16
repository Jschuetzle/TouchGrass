import { Injectable, Inject } from '@nestjs/common';
import { RekognitionClient, CreateCollectionCommand, DeleteCollectionCommand } from '@aws-sdk/client-rekognition';
import { REKOGNITION_PROVIDER_TOKEN_NAME } from '../common/constants';

@Injectable()
export class RekognitionService {
    constructor(@Inject(REKOGNITION_PROVIDER_TOKEN_NAME) private readonly rekognitionClient: RekognitionClient) {}

    async createCollection(collection_id: string) {
        const command = new CreateCollectionCommand({
            CollectionId: collection_id,
        })

        try {
            const resp = await this.rekognitionClient.send(command);
        } catch (err) {
            console.error(`Error creating collection: ${JSON.stringify(err, null, 2)}`)
        }   
    }

    async deleteCollection(collection_id: string) {
        const command = new DeleteCollectionCommand({
            CollectionId: collection_id,
        })

        try {
            const resp = await this.rekognitionClient.send(command);
        } catch (err) {
            console.error(`Error deleting collection: ${JSON.stringify(err, null, 2)}`)
        }   
    }
}

