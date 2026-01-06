import { UserResponseDto } from "../dto/response/UserReponseDto";
import { FriendDto } from "../dto/response/FriendDto";
import { GetFriendsResponseDto } from "../dto/response/GetFriendsResponseDto";

export class TouchgrassUser {
    static #isInternalConstructing = false;
    
    username: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    created_at?: Date;
    daily_upload_count?: number;
    profile_pic_link?: string;
    phone_number?: string;
    completed_new_user_flow?: boolean;

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

    static fromFriendDto(dto: FriendDto): TouchgrassUser {
        TouchgrassUser.#isInternalConstructing = true;

        return new TouchgrassUser({
            username: dto.username,
            profile_pic_link: dto.avatarUrl
        })
    }

    static fromGetFriendsResponseDto(dto: GetFriendsResponseDto): TouchgrassUser[] {
        TouchgrassUser.#isInternalConstructing = true;
        return dto.results.map((friendDto) => TouchgrassUser.fromFriendDto(friendDto));
    }

    clone(): TouchgrassUser {
        TouchgrassUser.#isInternalConstructing = true;

        return new TouchgrassUser({
            ...this,
        });
    }
}