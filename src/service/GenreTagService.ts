import DaoFactory from "../db/dao/DaoFactory";
import { Genre } from "../db/schema/Genre";
import { Tag } from "../db/schema/Tag";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import Service from "./Service";

export default class GenreTagService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async getGenres(): Promise<Response<Genre[]>> {
    const genreResponse = await this.genreDao.getAll();
    if (genreResponse.statusCode === 200 && genreResponse.object) {
      const resultObject = genreResponse.object.filter(val => val.genre_name !== 'Unknown')
      return new SuccessResponse(genreResponse.message, resultObject);
    } else {
      return genreResponse;
    }
  }

  public async addGenre(genre_name: string): Promise<Response<Genre>> {
    const genre_obj: Genre = {
      genre_name: genre_name,
    };

    const response = await this.genreDao.create(genre_obj);
    if (response.statusCode === 500 && response.message.includes("already exists")) {
      return new ServerErrorResponse(
        `Genre ${genre_name} already exists. Please use a different name.`
      );
    }
    return response;
  }

  public async removeGenre(genre_name: string): Promise<Response<Genre>> {
    const response = await this.genreDao.deleteOnIndexByValue("genre_name", genre_name);
    if (
      response.statusCode === 500 &&
      response.message.includes(
        "Cannot delete or update a parent row: a foreign key constraint fails"
      ) // this is the beginning of the MySQL error message for when a genre is still in use
      // note that we do not match on the whole message
      // as this error can come from both the books table and the genres table
      // depending on whether the genre is the primary genre or a secondary genre
    ) {
      return new ServerErrorResponse(
        `Genre ${genre_name} is still in use by at least one book. You must remove it from all books before deleting it.`
      );
    }

    return response;
  }

  public async getTags(): Promise<Response<any>> {
    const daoResult = await this.tagDao.getAll();
    if (daoResult.statusCode === 200 && daoResult.object) {
      const resultObject = daoResult.object.filter(val => val.tag_name !== 'Unknown')
      return new SuccessResponse(daoResult.message, resultObject);
    } else {
      return daoResult;
    }
  }

  public async addTag(tag_name: string): Promise<Response<Tag>> {
    const tag: Tag = {
      tag_name: tag_name,
    };

    const response = await this.tagDao.create(tag);
    if (response.statusCode === 500 && response.message.includes("already exists")) {
      return new ServerErrorResponse(
        `Tag ${tag_name} already exists. Please use a different name.`
      );
    }
    return response;
  }

  public async removeTag(tag_name: string): Promise<Response<Tag>> {
    const response = await this.tagDao.deleteOnIndexByValue("tag_name", tag_name);
    if (
      response.statusCode === 500 &&
      response.message.includes(
        "Cannot delete or update a parent row: a foreign key constraint fails"
      ) // this is the beginning of the MySQL error message for when a tag is still in use
    ) {
      return new ServerErrorResponse(
        `Tag ${tag_name} is still in use by at least one book. You must remove it from all books before deleting it.`
      );
    }

    return response;
  }
}
