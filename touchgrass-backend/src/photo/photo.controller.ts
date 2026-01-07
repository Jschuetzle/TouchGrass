import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { PhotoService } from "./photo.service";
import { FirebaseAuthGuard } from "src/firebase/auth/firebase-auth.guard";
import { FirebaseUser } from "src/firebase/auth/firebase-user.decorator";
import { DecodedIdToken } from "firebase-admin/auth";
import { PhotoUploadIntentsRequestDto } from "./dto/request/photo-upload-intent.dto";
import { PhotoUploadIntentResultsDto } from "./dto/response/photo-upload-intent-result.dto";
import { ValidatePhotosDto } from "./dto/request/validate-photo.dto";
import { ValidatePhotoResultsDto } from "./dto/response/validate-photo-result.dto";

@Controller('/photos')
export class PhotoController {
    constructor(private photoService: PhotoService) {}

    @UseGuards(FirebaseAuthGuard)
    // possible @UseInterceptors for transforming returned entities
    @Post('/intent')
    async createUploadIntents(
        @Body() body: PhotoUploadIntentsRequestDto, 
        @FirebaseUser() firebaseUser: DecodedIdToken,
    ): Promise<PhotoUploadIntentResultsDto> {
        return await this.photoService.handleUploadIntents(firebaseUser.uid, body);
    }


    @UseGuards(FirebaseAuthGuard)
    @Post('/validate')
    async validateUploads(
        @Body() body: ValidatePhotosDto,
        @FirebaseUser() firebaseUser: DecodedIdToken,
    ): Promise<ValidatePhotoResultsDto> {
        return await this.photoService.validatePhotos(firebaseUser.uid, body);
    }
}