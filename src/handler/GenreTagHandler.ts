import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import { Campus } from "../db/schema/Campus";
import GenreTagService from "../service/GenreTagService";
import { Tag } from "../db/schema/Tag";
import { Genre } from "../db/schema/Genre";

export default class GenreTagHandler {
  genreTagService: GenreTagService;

  constructor(genreTagService: GenreTagService) {
    this.genreTagService = genreTagService;
  }

  public async addGenre(body): Promise<Response<Genre>> {
    if (!body.genre_name) {
      return new RequestErrorResponse("Request is missing genre name", 400);
    }

    return await this.genreTagService.addGenre(body.genre_name);
  }

  public async removeGenre(body): Promise<Response<Genre>> {
    if (!body.genre_name) {
      return new RequestErrorResponse("Request is missing genre name", 400);
    }

    return await this.genreTagService.removeGenre(body.genre_name);
  }

  public async addTag(body): Promise<Response<Tag>> {
    if (!body.tag_name) {
      return new RequestErrorResponse("Request is missing tag name", 400);
    }

    return await this.genreTagService.addTag(body.tag_name);
  }

  public async removeTag(body): Promise<Response<Tag>> {
    if (!body.tag_name) {
      return new RequestErrorResponse("Request is missing tag name", 400);
    }

    return await this.genreTagService.removeTag(body.tag_name);
  }
}
