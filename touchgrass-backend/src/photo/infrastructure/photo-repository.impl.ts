import { Injectable } from "@nestjs/common";
import { PhotoRepository } from "../domain/photo-repository.interface";
import { Photo } from "../domain/photo.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PhotoRepositoryImpl implements PhotoRepository {
    constructor(
        @InjectRepository(Photo)
        private readonly photoRepo: Repository<Photo>,
    ) {}

    createPhotoEntity(id: string, userId: string): Photo {
        return this.photoRepo.create({
            id: id,
            owner_id: userId,
        });
    }

    async delete(id: string): Promise<void> {
        await this.photoRepo.delete(id);
    }

    async getPhotoById(id: string): Promise<Photo | null> {
        return await this.photoRepo.findOneBy({ id });
    }

    async insertEntity(photo: Photo): Promise<void> {
        await this.photoRepo.insert(photo);
    }

    async updateModelFaceId(photo_id: string, model_face_id: string): Promise<void> {
        this.photoRepo.update(photo_id, { model_face_id });
    }
}