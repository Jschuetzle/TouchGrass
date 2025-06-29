"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpisodesController = void 0;
const common_1 = require("@nestjs/common");
const episodes_service_1 = require("./episodes.service");
const create_episode_dto_1 = require("./dto/create-episode.dto");
const config_service_1 = require("../config/config.service");
const is_positive_pipe_1 = require("../is-positive/is-positive.pipe");
let EpisodesController = class EpisodesController {
    episodesService;
    configService;
    constructor(episodesService, configService) {
        this.episodesService = episodesService;
        this.configService = configService;
    }
    findAll(sort = 'desc', limit) {
        console.log(sort);
        return this.episodesService.findAll(sort);
    }
    findFeatured() {
        return this.episodesService.findFeatured();
    }
    async findOne(id) {
        console.log(id);
        const episode = await this.episodesService.findOne(id);
        if (!episode) {
            throw new common_1.NotFoundException("Episode not found");
        }
        return episode;
    }
    create(input) {
        console.log(input);
        return this.episodesService.create(input);
    }
};
exports.EpisodesController = EpisodesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('sort')),
    __param(1, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(200), common_1.ParseIntPipe, is_positive_pipe_1.IsPositivePipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], EpisodesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('featured'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EpisodesController.prototype, "findFeatured", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EpisodesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_episode_dto_1.CreateEpisodeDto]),
    __metadata("design:returntype", void 0)
], EpisodesController.prototype, "create", null);
exports.EpisodesController = EpisodesController = __decorate([
    (0, common_1.Controller)('episodes'),
    __metadata("design:paramtypes", [episodes_service_1.EpisodesService,
        config_service_1.ConfigService])
], EpisodesController);
//# sourceMappingURL=episodes.controller.js.map