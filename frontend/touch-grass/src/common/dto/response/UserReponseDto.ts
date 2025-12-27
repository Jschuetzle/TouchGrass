import { Expose, Type } from "class-transformer";

export class UserResponseDto {
    @Expose()
    username: string;

    @Expose()
    firstname?: string;

    @Expose()
    lastname?: string;

    @Expose()
    email?: string;

    @Expose()
    phone_number?: string;

    @Type(() => Date)
    created_at: Date;
    
    @Expose()
    daily_upload_count: number;

    @Expose()
    profile_pic_link?: string;

    @Expose()
    completed_new_user_flow: boolean;
}