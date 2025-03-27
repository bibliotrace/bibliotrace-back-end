import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import GenreTagService from "../service/GenreTagService";
import { Tag } from "../db/schema/Tag";
import { Genre } from "../db/schema/Genre";

export default class GenreTagHandler {
  genreTagService: GenreTagService;

  constructor(genreTagService: GenreTagService) {
    this.genreTagService = genreTagService;
  }

  public async getGenres(): Promise<Response<Genre[]>> {
    return await this.genreTagService.getGenres();
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

  public async getAllTags(authData): Promise<Response<Tag[]>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication");
    }
    return await this.genreTagService.getTags(authData.userRole?.campus)
  }

  public async addTag(body, authData): Promise<Response<Tag>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
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
