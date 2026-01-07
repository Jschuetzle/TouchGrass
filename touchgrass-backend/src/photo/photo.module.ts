import { Module } from "@nestjs/common";
import { PhotoController } from "./photo.controller";
import { PhotoService } from "./photo.service";
import { FirebaseAuthModule } from "src/firebase/auth/firebase-auth.module";
import { UserModule } from "src/user/user.module";
import { S3Module } from "src/s3/s3.module";
import { RedisModule } from "src/redis/redis.module";
import { RekognitionModule } from "src/rekognition/rekognition.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Photo } from "./domain/photo.entity";
import { PHOTO_REPOSITORY_TOKEN } from "src/common/constants/provider-tokens";
import { PhotoRepositoryImpl } from "./infrastructure/photo-repository.impl";

@Module({
    imports: [
        TypeOrmModule.forFeature([Photo]),
        FirebaseAuthModule,
        UserModule,
        S3Module,
        RedisModule,
        RekognitionModule,
    ],
    controllers: [PhotoController],
    providers: [
        PhotoService,
        {
            provide: PHOTO_REPOSITORY_TOKEN, useClass: PhotoRepositoryImpl,
        },
    ],
    exports: [PhotoService],
})
export class PhotosModule {}