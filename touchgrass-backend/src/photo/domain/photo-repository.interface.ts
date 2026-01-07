import { Photo } from "./photo.entity";

export interface PhotoRepository {
    createPhotoEntity(id: string, userId: string): Photo;
    delete(id: string): Promise<void>;
    getPhotoById(id: string): Promise<Photo | null>;
    insertEntity(photo: Photo): Promise<void>;
    updateModelFaceId(photo_id: string, model_face_id: string): Promise<void>;
}