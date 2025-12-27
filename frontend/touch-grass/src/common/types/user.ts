import { UserResponseDto } from "../dto/response/UserReponseDto";

export class TouchgrassUser {
    static #isInternalConstructing = false;
    
    username: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    created_at: Date;
    daily_upload_count: number;
    profile_pic_link?: string;
    phone_number?: string;
    completed_new_user_flow: boolean;

    constructor(data: Partial<TouchgrassUser>) {
        if (!TouchgrassUser.#isInternalConstructing) {
            throw new TypeError("Must instantiate TouchgrassUser through static factories");
        }
        TouchgrassUser.#isInternalConstructing = false;
        Object.assign(this, data);
    }

    static fromDto(dto: UserResponseDto): TouchgrassUser {
        TouchgrassUser.#isInternalConstructing = true;

        return new TouchgrassUser({
            username: dto.username ?? "",
            firstname: dto.firstname,
            lastname: dto.lastname,
            email: dto.email,
            created_at: dto.created_at,
            daily_upload_count: dto.daily_upload_count,
            phone_number: dto.phone_number,
            completed_new_user_flow: dto.completed_new_user_flow
        })
    }

    clone(): TouchgrassUser {
        TouchgrassUser.#isInternalConstructing = true;

        return new TouchgrassUser({
            ...this,
        });
    }
}