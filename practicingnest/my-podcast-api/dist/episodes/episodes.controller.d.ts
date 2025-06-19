import { EpisodesService } from './episodes.service';
import { CreateEpisodeDto } from './dto/create-episode.dto';
import { ConfigService } from '../config/config.service';
export declare class EpisodesController {
    private episodesService;
    private configService;
    constructor(episodesService: EpisodesService, configService: ConfigService);
    findAll(sort: "asc" | "desc" | undefined, limit: number): Promise<import("./entity/episode.entity").Episode[]>;
    findFeatured(): Promise<import("./entity/episode.entity").Episode[]>;
    findOne(id: string): Promise<import("./entity/episode.entity").Episode>;
    create(input: CreateEpisodeDto): Promise<import("./entity/episode.entity").Episode>;
}
