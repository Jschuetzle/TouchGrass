import { Injectable } from "@nestjs/common";
import { UserRepository } from "../domain/user-repository.interface";
import { CreateUserProps } from "../domain/types/create-user-props";
import { User } from "../domain/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DEFAULT_DAILY_UPLOAD_COUNT } from "src/common/constants/user";
import { PhotoUploadLimitExceededError } from "src/common/errors/photo-upload-limit-exceeded.error";

@Injectable()
export class UserRepositoryImpl implements UserRepository {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) {}
    
    createUserEntity(props: CreateUserProps): User {
        return this.userRepo.create({
            ...props,
        });
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return await this.userRepo.findOneBy({ username });
    }

    async getUserById(id: string): Promise<User | null> {
        return await this.userRepo.findOneBy({ id });
    }

    async insertEntity(user: User): Promise<void>{
        await this.userRepo.insert(user);
    }

    async saveEntity(user: User): Promise<User> {
        return await this.userRepo.save(user);
    }

    async addToUserUploadCount(id: string, count: number): Promise<void> {
        const result = await this.userRepo
            .createQueryBuilder()
            .update(User)
            .set({ daily_upload_count: () => "daily_upload_count + :count" })
            .where("user.id = :id", { id })
            .andWhere("daily_upload_count + :count <= :daily_limit")
            .setParameters({ 
                count,
                "daily_limit": DEFAULT_DAILY_UPLOAD_COUNT,
            })
            .returning(['daily_upload_count'])
            .execute();

        if (result.affected === 0) {
            // in the future, would be nice to figure out how to obtain the amount exceededBy in the above query
            throw new PhotoUploadLimitExceededError(id);
        }
    }

    async updateProfilePicObjKey(id: string, objKey: string): Promise<void> {
        await this.userRepo.update(id, { profile_pic_obj_key: objKey });
    }
}