// common/dto/response/GetFriendRequestResponseDto.ts
import { Expose , Type} from "class-transformer";
import { UserResponseDto } from "./UserReponseDto";

export class GetFriendRequestsResponseDto {
    @Expose()
    @Type(() => UserResponseDto)
    requests: UserResponseDto[];
}