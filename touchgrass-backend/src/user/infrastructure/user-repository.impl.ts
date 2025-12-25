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

    async getUserEntity(username: string): Promise<User | null> {
        return await this.userRepo.findOneBy({ username });
    }

    async insertEntity(user: User): Promise<void>{
        await this.userRepo.insert(user);
    };
}