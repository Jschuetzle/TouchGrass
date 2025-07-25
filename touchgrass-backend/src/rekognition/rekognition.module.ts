import { Global, Module } from '@nestjs/common';
import { RekognitionClient } from '@aws-sdk/client-rekognition';
import { RekognitionService } from './rekognition.service';

@Global()
@Module({
    providers: [
        {
            provide: 'REKOGNITION_CLIENT',
            useFactory: (): RekognitionClient => {
                // empty args, as config should be in ~/.aws or through IAM role
                return new RekognitionClient({ region: process.env.AWS_REGION });
            }
        },
        RekognitionService
    ],
    exports: ['REKOGNITION_CLIENT'],
})
export class RekognitionModule {}
