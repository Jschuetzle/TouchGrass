import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user-repository.interface";
import { CreateUserProps } from "../domain/types/create-user-props";
import { User } from "../domain/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class UserRepositoryImpl implements UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {};
    
    createUserEntity(props: CreateUserProps): User {
        return this.userRepo.create({
            ...props,
        });
    };

    async getUserByUsername(username: string): Promise<User | null> {
        return await this.userRepo.findOneBy({ username });
    }

    async getUserById(id: string): Promise<User | null> {
        return await this.userRepo.findOneBy({ id });
    }

    async insertEntity(user: User): Promise<void>{
        await this.userRepo.insert(user);
    };

    async saveEntity(user: User): Promise<User> {
        return await this.userRepo.save(user);
    }
}