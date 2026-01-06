import { Injectable, Inject } from '@nestjs/common';
import { RekognitionClient, DetectFacesCommand, DetectFacesCommandOutput, Attribute } from '@aws-sdk/client-rekognition';
import { REKOGNITION_DETECTFACES_DEFAULT_ATTRIBUTES } from '../common/constants/rekognition';
import { REKOGNITION_PROVIDER_TOKEN } from '../common/constants/provider-tokens';
import { ValidationRule } from './validation/validation-rule.interface';
import { PROFILE_PIC_VALIDATION_RULES } from './validation/profile-pic.rules';
import { RekognitionClientRuleViolationError } from './exceptions/rekognition-client-rule-violation.error';
import { RekognitionServiceError } from './exceptions/rekognition-service.error';

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
        } catch (err) {
            throw new RekognitionServiceError(err, 'DETECT_FACES');
        }
    }

    validateProfilePic(data: DetectFacesCommandOutput) {
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

