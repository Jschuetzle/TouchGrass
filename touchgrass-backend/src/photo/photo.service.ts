import { Injectable } from "@nestjs/common";
import { PhotoUploadIntentsRequestDto } from "./dto/request/photo-upload-intent.dto";
import { UserService } from "src/user/user.service";
import { PhotoUploadIntentResultDto, PhotoUploadIntentResultsDto } from "./dto/response/photo-upload-intent-result.dto";
import { REKOGNITION_MAX_S3_OBJECT_SIZE } from "src/common/constants/rekognition";
import { DEFAULT_DAILY_UPLOAD_COUNT } from "src/common/constants/user";
import { PhotoUploadLimitExceededError } from "src/common/errors/photo-upload-limit-exceeded.error";
import { S3Service } from "src/s3/s3.service";
import { RedisService } from "src/redis/redis.service";
import { UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME, UPLOAD_INTENT_PROFILE_PIC_EXPIRATION_TIME } from "src/common/constants/photos";
import { UploadLimitAlreadyReachedError } from "src/common/errors/upload-limit-already-reached.error";

@Injectable()
export class PhotoService {
    constructor(
        private readonly userService: UserService,
        private readonly s3Service: S3Service,
        private readonly redisService: RedisService,
    ) {}

    async handleUploadIntents(userId: string, uploadIntents: PhotoUploadIntentsRequestDto): Promise<PhotoUploadIntentResultsDto> {
        // check if number of intents and existing uploads together goes past daily limit
        // profile pics don't count towards daily limit
        if (!uploadIntents.is_profile_pic) {
            const userEntity = await this.userService.findUserById(userId);
            if (userEntity.daily_upload_count === DEFAULT_DAILY_UPLOAD_COUNT) {
                throw new UploadLimitAlreadyReachedError(userId);
            }

            const exceededBy = Math.max(0, (userEntity.daily_upload_count + uploadIntents.intents.length) - DEFAULT_DAILY_UPLOAD_COUNT);
            if (exceededBy > 0) {
                throw new PhotoUploadLimitExceededError(userId, exceededBy);
            }
        }

        const uploadIntentResults: PhotoUploadIntentResultDto[] = [];
        let successfulIntentCount = 0; // in order to accurately track the number of upload intents we'll allocate

        // validate the metadata in request body against photo rules, if the metadata is provided
        for (const intent of uploadIntents.intents) {
            let intentResult: PhotoUploadIntentResultDto;

            // ValidatorPipe takes care of checking the mime type (if it exists), so just check file size

            if (intent.size && intent.size > REKOGNITION_MAX_S3_OBJECT_SIZE) {
                intentResult = {
                    id: intent.id,
                    success: false,
                    error: 'File size exceeded the maximum size of 15MB',
                }
            }
            else {
                successfulIntentCount++;

                // can't construct a complete successful intent object yet bc url resources aren't created yet
                intentResult = {
                    id: intent.id,
                    success: true,
                }
            }
            uploadIntentResults.push(intentResult);
        }

        // update the number of intents alloted...will throw UserDomainError if count exceeds limit during update
        // we do a second check here, as the daily upload count could've changed during the above validation
        if (!uploadIntents.is_profile_pic) {
            this.userService.addToDailyUploadCount(userId, successfulIntentCount);
        }

        // create resources for all successful intents
        const expiration = uploadIntents.is_profile_pic ? UPLOAD_INTENT_PROFILE_PIC_EXPIRATION_TIME : UPLOAD_INTENT_NORMAL_PIC_EXPIRATION_TIME;
        const objectKeyPrefix = uploadIntents.is_profile_pic ? 'profile-pic/' : '';

        for (let i=0; i < uploadIntentResults.length; i++) {
            if (uploadIntentResults[i].success) {
                const objectKey = `raw/${objectKeyPrefix}${crypto.randomUUID()}`;

                await this.redisService.createTimedUploadIntent(objectKey, userId, expiration);
                const presignedUrl = await this.s3Service.generatePutPresignedUrl(
                    objectKey,
                    expiration,
                    uploadIntents.intents[i].content_type ?? '',
                    uploadIntents.intents[i].size ?? 0,
                )

                uploadIntentResults[i].object_key = objectKey;
                uploadIntentResults[i].presigned_url = presignedUrl;
            }
        }

        return { intent_results: uploadIntentResults } as PhotoUploadIntentResultsDto;
    }
}