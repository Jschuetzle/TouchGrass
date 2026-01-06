import { Module } from "@nestjs/common";
import { PhotoController } from "./photo.controller";
import { PhotoService } from "./photo.service";
import { FirebaseAuthModule } from "src/firebase/auth/firebase-auth.module";
import { UserModule } from "src/user/user.module";
import { S3Module } from "src/s3/s3.module";
import { RedisModule } from "src/redis/redis.module";

@Module({
    imports: [
        FirebaseAuthModule,
        UserModule,
        S3Module,
        RedisModule,
    ],
    controllers: [PhotoController],
    providers: [PhotoService],
    exports: []
})
export class PhotosModule {}