export type UpdateUserData = {
    username?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    daily_upload_count?: number;
    profile_pic_link?: string;
    phone_number?: string;
    completed_new_user_flow?: boolean;
}


export class UpdateUserResponseDto {
    success: boolean;
    data: UpdateUserData | null;
}