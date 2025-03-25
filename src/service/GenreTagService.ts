import DaoFactory from "../db/dao/DaoFactory";
import { Campus } from "../db/schema/Campus";
import { Genre } from "../db/schema/Genre";
import { Tag } from "../db/schema/Tag";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import Service from "./Service";

export default class GenreTagService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async addGenre(genre_name: string): Promise<Response<Genre>> {
    const genre_obj: Genre = {
      genre_name: genre_name,
    };

    return await this.genreDao.create(genre_obj);
  }

  public async removeGenre(genre_name: string): Promise<Response<Genre>> {
    return await this.genreDao.deleteOnIndexByValue("genre_name", genre_name);
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
