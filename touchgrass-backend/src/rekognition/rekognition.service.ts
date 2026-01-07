import { Injectable, Inject } from '@nestjs/common';
import { RekognitionClient, DetectFacesCommand, DetectFacesCommandOutput, Attribute, CreateUserCommand, IndexFacesCommandOutput, IndexFacesCommand, DeleteFacesCommandOutput, DeleteFacesCommand, AssociateFacesCommand, AssociateFacesCommandOutput, DisassociateFacesCommandOutput, DisassociateFacesCommand } from '@aws-sdk/client-rekognition';
import { REKOGNITION_COLLECTION_ID, REKOGNITION_DETECTFACES_DEFAULT_ATTRIBUTES, REKOGNITION_PROFILEPIC_VALIDATION_ATTRIBUTES } from '../common/constants/rekognition';
import { REKOGNITION_PROVIDER_TOKEN } from '../common/constants/provider-tokens';
import { ValidationRule } from './validation/validation-rule.interface';
import { ASSOCIATE_FACES_PROFILE_PHOTO_RULES, DELETE_FACES_PROFILE_PHOTO_RULES, DISASSOCIATE_FACES_PROFILE_PHOTO_RULES, INDEX_FACES_PROFILE_PHOTO_RULES, PROFILE_PIC_VALIDATION_RULES } from './validation/profile-pic.rules';
import { RekognitionClientRuleViolationError } from './exceptions/rekognition-client-rule-violation.error';
import { RekognitionServiceError } from './exceptions/rekognition-service.error';

@Injectable()
export class RekognitionService {
    constructor(@Inject(REKOGNITION_PROVIDER_TOKEN) private readonly rekognitionClient: RekognitionClient) {}

    async detectFaces(objectKey: string, attributes: Attribute[] = REKOGNITION_DETECTFACES_DEFAULT_ATTRIBUTES): Promise<DetectFacesCommandOutput> {
        const command = new DetectFacesCommand({
            Attributes: attributes,
            Image: {
                S3Object: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Name: `raw/${objectKey}`,
                },
            },
        });

        try {
            return await this.rekognitionClient.send(command);
        } catch (err) {
            throw new RekognitionServiceError(err, 'DETECT_FACES');
        }
    }


    async createUser(userId: string): Promise<void> {
        const command = new CreateUserCommand({
            CollectionId: REKOGNITION_COLLECTION_ID,
            UserId: userId,
            ClientRequestToken: `create-user_${userId}`,
        });

        try {
            await this.rekognitionClient.send(command);
        } catch (err) {
            throw new RekognitionServiceError(err, 'CREATE_USER');
        }
    }


    async indexFaces(objectKey: string, externalImageId?: string): Promise<IndexFacesCommandOutput> {
        const command = new IndexFacesCommand({
            CollectionId: REKOGNITION_COLLECTION_ID,
            Image: {
                S3Object: {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Name: objectKey,
                }
            },
            ...(externalImageId ? { ExternalImageId: externalImageId } : {}),
        });

        try {
            return await this.rekognitionClient.send(command);
        } catch (err) {
            throw new RekognitionServiceError(err, 'INDEX_FACES');
        }
    }

    
    async deleteFaces(faceIds: string[]): Promise<DeleteFacesCommandOutput> {
        const command = new DeleteFacesCommand({
            CollectionId: REKOGNITION_COLLECTION_ID,
            FaceIds: faceIds,
        });

        try {
            return await this.rekognitionClient.send(command);
        } catch (err) {
            throw new RekognitionServiceError(err, 'DELETE_FACES');
        }
    }


    async associateFaces(userId: string, faceIds: string[]): Promise<AssociateFacesCommandOutput> {
        const command = new AssociateFacesCommand({
            CollectionId: REKOGNITION_COLLECTION_ID,
            UserId: userId,
            FaceIds: faceIds,
        });

        try {
            return await this.rekognitionClient.send(command);
        } catch (err) {
            console.log(err);
            throw new RekognitionServiceError(err, 'ASSOCIATE_FACES');
        }
    }


    async disassociateFaces(userId: string, faceIds: string[]): Promise<DisassociateFacesCommandOutput> {
        const command = new DisassociateFacesCommand({
            CollectionId: REKOGNITION_COLLECTION_ID,
            UserId: userId,
            FaceIds: faceIds,
        });

        try {
            return await this.rekognitionClient.send(command);
        } catch (err) {
            console.log(err);
            throw new RekognitionServiceError(err, 'ASSOCIATE_FACES');
        }
    }


    async replaceProfilePic(userId: string, newObjectKey: string, oldFaceId?: string): Promise<string> {
        // add new photo into Rekognition collection
        const indexFacesOutput = await this.indexFaces(newObjectKey);
        this.validateFaceOutput<IndexFacesCommandOutput>(indexFacesOutput, INDEX_FACES_PROFILE_PHOTO_RULES);
        const faceId = indexFacesOutput.FaceRecords![0].Face!.FaceId as string;

        // associate new photo with the user's rekognition profile
        const associateFaceOutput = await this.associateFaces(userId, [faceId]);
        this.validateFaceOutput<AssociateFacesCommandOutput>(associateFaceOutput, ASSOCIATE_FACES_PROFILE_PHOTO_RULES);

        // remove the faceid corresponding to old profile photo
        if (oldFaceId) {
            // can't delete a photo without first disassociating it
            const disassociateFacesOutput = await this.disassociateFaces(userId, [oldFaceId]);
            this.validateFaceOutput<DisassociateFacesCommandOutput>(disassociateFacesOutput, DISASSOCIATE_FACES_PROFILE_PHOTO_RULES);

            const deleteFacesOutput = await this.deleteFaces([oldFaceId]);
            this.validateFaceOutput<DeleteFacesCommandOutput>(deleteFacesOutput, DELETE_FACES_PROFILE_PHOTO_RULES);
        }

        return faceId;
    }


    async validateProfilePic(objectKey: string): Promise<void> {
        const data = await this.detectFaces(objectKey, REKOGNITION_PROFILEPIC_VALIDATION_ATTRIBUTES);
        this.validateFaceOutput<DetectFacesCommandOutput>(data, PROFILE_PIC_VALIDATION_RULES);
    }


    validateFaceOutput<T>(data: T, rules: ValidationRule<T>[]) {
        for (const rule of rules) {
            if (!rule.validation_fn(data)) {
                throw new RekognitionClientRuleViolationError(
                    rule.name,
                    rule.err_code,
                    rule.err_msg,
                );
            }
        }
    }
}

