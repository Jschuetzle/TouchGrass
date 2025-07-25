import { Injectable, Inject } from '@nestjs/common';
import { RekognitionClient, CreateCollectionCommand, DeleteCollectionCommand, ListCollectionsCommand } from '@aws-sdk/client-rekognition';

@Injectable()
export class RekognitionService {
    constructor(@Inject('REKOGNITION_CLIENT') private readonly rekognitionClient: RekognitionClient) {}

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

    async listCollections() {
        const command = new ListCollectionsCommand();

        try {
            const resp = await this.rekognitionClient.send(command);
        } catch (err) {
            console.error(`Error listing collection: ${JSON.stringify(err, null, 2)}`)
        }   
    }
}

