import { Episode } from './entity/episode.entity';
import { CreateEpisodeDto } from './dto/create-episode.dto';
export declare class EpisodesService {
    private episodes;
    findAll(sort?: 'asc' | 'desc'): Promise<Episode[]>;
    findOne(id: string): Promise<Episode | undefined>;
    findFeatured(): Promise<Episode[]>;
    create(createEpisodeDto: CreateEpisodeDto): Promise<Episode>;
}
