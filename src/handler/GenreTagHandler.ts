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

  public async addGenre(body, authData): Promise<Response<Genre | Campus>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.genre_name) {
      return new RequestErrorResponse("Request is missing genre name", 400);
    }

    return await this.genreTagService.addGenre(body.genre_name, authData.userRole?.campus);
  }

  public async removeGenre(body, authData): Promise<Response<Genre | Campus>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.genre_name) {
      return new RequestErrorResponse("Request is missing genre name", 400);
    }

    return await this.genreTagService.removeGenre(body.genre_name, authData.userRole?.campus);
  }

  public async getAllTags(authData): Promise<Response<Tag[] | Campus>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication");
    }
    return await this.genreTagService.getTags(authData.userRole?.campus)
  }

  public async addTag(body, authData): Promise<Response<Tag | Campus>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.tag_name) {
      return new RequestErrorResponse("Request is missing tag name", 400);
    }

    return await this.genreTagService.addTag(body.tag_name, authData.userRole?.campus);
  }

  public async removeTag(body, authData): Promise<Response<Tag | Campus>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!body.tag_name) {
      return new RequestErrorResponse("Request is missing tag name", 400);
    }

    return await this.genreTagService.removeTag(body.tag_name, authData.userRole?.campus);
  }
}
