import { UserResponseDto } from "../dto/users/UserResponseDto";

export class TouchgrassUser {
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    created_at: Date | undefined;
    daily_upload_count: number | undefined;
    profile_pic_link: string;
    phone_number: string;
    completed_new_user_flow: boolean | undefined;

    constructor(data: Partial<TouchgrassUser>) {
        Object.assign(this, data);
    }

    static fromDto(dto: Partial<UserResponseDto>): TouchgrassUser {
        return new TouchgrassUser({
            username: dto.username ?? "",
            firstname: dto.firstname ?? "",
            lastname: dto.lastname ?? "",
            email: dto.email ?? "",
            created_at: dto.created_at,
            daily_upload_count: dto.daily_upload_count,
            profile_pic_link: dto.profile_pic_link ?? "",
            phone_number: dto.phone_number ?? "",
            completed_new_user_flow: dto.completed_new_user_flow,
        });
    }
}