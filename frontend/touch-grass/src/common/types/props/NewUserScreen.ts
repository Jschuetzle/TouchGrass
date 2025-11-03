import { CreateUserRequestDto } from "@/common/dto/request/CreateUserDto";

export type NewUserScreenProps = {
    onContinue: (dto: CreateUserRequestDto) => void;
}