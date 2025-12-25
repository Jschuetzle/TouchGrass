import { Global, Module } from '@nestjs/common';
import { RekognitionClient } from '@aws-sdk/client-rekognition';
import { RekognitionService } from './rekognition.service';
import { REKOGNITION_PROVIDER_TOKEN } from '../common/constants/provider-tokens';

@Global()
@Module({
    providers: [
        {
            provide: REKOGNITION_PROVIDER_TOKEN,
            useFactory: (): RekognitionClient => {
                return new RekognitionClient({ region: process.env.AWS_REGION });
            }
        },
        RekognitionService
    ],
    exports: [RekognitionService],
})
export class RekognitionModule {}
