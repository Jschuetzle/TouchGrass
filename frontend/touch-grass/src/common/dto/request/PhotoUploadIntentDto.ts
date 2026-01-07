import { PhotoOperation } from "@/common/types/photo";
import { Expose, Transform, Type } from "class-transformer";

export class PhotoUploadIntentDto {
    @Expose()
    id: string;
    
    @Expose()
    @Transform(({ value }) => value ?? undefined)
    content_type?: string;

    @Expose()
    @Transform(({ value }) => value ?? undefined)
    size?: number;
}

export class PhotoUploadIntentsRequestDto {
    @Expose()
    op: PhotoOperation;

    @Expose()
    @Type(() => PhotoUploadIntentDto)
    intents: PhotoUploadIntentDto[];
}
