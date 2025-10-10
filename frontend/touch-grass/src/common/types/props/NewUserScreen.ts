import { CreateUserDto } from "@/common/dto/users/CreateUserDto";

export type NewUserScreenProps = {
    onContinue: (dto: CreateUserDto) => void;
}