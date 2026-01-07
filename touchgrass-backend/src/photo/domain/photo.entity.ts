import { OWNERID_PHOTO_CONSTRAINT_NAME, PHOTO_PK_CONSTRAINT_NAME } from "src/common/constants/db-constraints";
import { PHOTO_ENTITY_CONSTANTS } from "src/common/constants/photos";
import { USER_ENTITY_CONSTANTS } from "src/common/constants/user";
import { User } from "src/user/domain/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";

@Entity('photo')
export class Photo {
    @PrimaryColumn({
        type: 'varchar',
        length: PHOTO_ENTITY_CONSTANTS.ID_MAX_LENGTH,
        primaryKeyConstraintName: PHOTO_PK_CONSTRAINT_NAME,
    })
    id: string;

    @Column({
        type: 'varchar',
        length: USER_ENTITY_CONSTANTS.ID_MAX_LENGTH,
    })
    owner_id: string;

    @Column({
        type: 'varchar',
        length: PHOTO_ENTITY_CONSTANTS.FACE_ID_MAX_LENGTH,
        nullable: true,
    })
    model_face_id: string;

    @CreateDateColumn()
    uploaded_at: Date;

    @ManyToOne(() => User, user => user.photos, { onDelete: 'CASCADE' })
    @JoinColumn({
        name: 'owner_id',
        foreignKeyConstraintName: OWNERID_PHOTO_CONSTRAINT_NAME,
    })
    user: User;
}