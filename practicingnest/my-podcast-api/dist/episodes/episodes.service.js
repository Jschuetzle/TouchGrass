"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpisodesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
let EpisodesService = class EpisodesService {
    episodes = [];
    async findAll(sort = 'asc') {
        const sortAsc = (a, b) => (a.name > b.name ? 1 : -1);
        const sortDesc = (a, b) => (a.name < b.name ? 1 : -1);
        return sort === 'asc'
            ? this.episodes.sort(sortAsc)
            : this.episodes.sort(sortDesc);
    }
    async findOne(id) {
        return this.episodes.find((episode) => episode.id === id);
    }
    async findFeatured() {
        return this.episodes.filter((episode) => episode.featured);
    }
    async create(createEpisodeDto) {
        const newEpisode = {
            ...createEpisodeDto,
            id: (0, crypto_1.randomUUID)(),
        };
        this.episodes.push(newEpisode);
        return newEpisode;
    }
};
exports.EpisodesService = EpisodesService;
exports.EpisodesService = EpisodesService = __decorate([
    (0, common_1.Injectable)()
], EpisodesService);
//# sourceMappingURL=episodes.service.js.map