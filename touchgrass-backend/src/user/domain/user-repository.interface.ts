import { User } from "../domain/user.entity";
import { CreateUserProps } from "./types/create-user-props";

export interface UserRepository {
    createUserEntity(props: CreateUserProps): User;
    getUserEntity(username: string): Promise<User | null>;
    insertEntity(user: User): Promise<void>;
}