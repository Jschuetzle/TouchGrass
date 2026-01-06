import { User } from "../domain/user.entity";
import { CreateUserProps } from "./types/create-user-props";

export interface UserRepository {
    createUserEntity(props: CreateUserProps): User;
    getUserByUsername(username: string): Promise<User | null>;
    getUserById(id: string): Promise<User | null>;
    insertEntity(user: User): Promise<void>;
    saveEntity(user: User): Promise<User>;
    addToUserUploadCount(id: string, count: number): Promise<void>;
}