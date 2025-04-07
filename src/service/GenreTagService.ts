import DaoFactory from "../db/dao/DaoFactory";
import { Genre } from "../db/schema/Genre";
import { Tag } from "../db/schema/Tag";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import Service from "./Service";

export default class GenreTagService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async getGenres(): Promise<Response<Genre[]>> {
    return await this.genreDao.getAll();
  }

  public async addGenre(genre_name: string): Promise<Response<Genre>> {
    const genre_obj: Genre = {
      genre_name: genre_name,
    };

    return await this.genreDao.create(genre_obj);
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
        `Genre ${genre_name}is still in use by at least one book. You must remove it from all books before deleting it.`
      );
    }

    return response;
  }

  public async getTags(campus_name: string): Promise<Response<any>> {
    const campusResponse = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campusResponse.statusCode !== 200) {
      return campusResponse;
    } else if (!campusResponse.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }
    const campusId = campusResponse.object.id;
    console.log(campusId);
    // TODO: Use this to keep tags by the campus?

    const daoResult = await this.tagDao.getAll();
    console.log(daoResult);
    return daoResult;
  }

  public async addTag(tag_name: string): Promise<Response<Tag>> {
    const tag: Tag = {
      tag_name: tag_name,
    };
    return await this.tagDao.create(tag);
  }

  public async removeTag(tag_name: string): Promise<Response<Tag>> {
    return await this.tagDao.deleteOnIndexByValue("tag_name", tag_name);
  }
}
