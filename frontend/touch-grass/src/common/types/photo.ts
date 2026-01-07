import { PhotoUploadIntentResultDto } from "../dto/response/PhotoUploadIntentResultDto";

export type ImageAsset = {
    id: string;
    content_type?: string;
    size?: number;
}

export type ImageAssetWithId = {
    uri: string;
    asset: ImageAsset;
}

export enum PhotoOperation {
    PROFILE_PIC = 'profile-pic',
    NORMAL_ALBUM = 'normal-album',
    GROUP_ALBUM = 'group-album',
}


export type CloudStorageUploadResult = {
    successfulUploads: PhotoUploadIntentResultDto[];
    unsuccessfulUploads: PhotoUploadIntentResultDto[];
}