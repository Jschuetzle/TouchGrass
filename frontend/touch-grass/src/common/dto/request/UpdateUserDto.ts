import { CreateUserRequestDto } from "@/common/dto/request/CreateUserDto";

/*
    With this definition, it would be possible to construct an empty
    dto. This is something to prevent later, as it would be the fault of
    the programmer constructing an empty dto.
*/
export class UpdateUserRequestDto {
    username?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    daily_upload_count?: number;
    profile_pic_link?: string;
    phone_number?: string;
    completed_new_user_flow?: boolean;

    constructor(init?: Partial<UpdateUserRequestDto>) {
        Object.assign(this, init);
    }
}
