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

  public async addGenre(
    genre_name: string,
    campus_name: string
  ): Promise<Response<Genre | Campus>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    const genre_obj: Genre = {
      genre_name: genre_name,
    };

    return await this.genreDao.create(genre_obj);
  }

  public async removeGenre(
    genre_name: string,
    campus_name: string
  ): Promise<Response<Genre | Campus>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.genreDao.deleteOnIndexByValue("genre_name", genre_name);
  }

  public async addTag(tag_name: string, campus_name: string): Promise<Response<Tag | Campus>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    const tag: Tag = {
      tag_name: tag_name,
    };
    return await this.tagDao.create(tag);
  }

  public async removeTag(tag_name: string, campus_name: string): Promise<Response<Tag | Campus>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campus_name}`, 500);
    }

    return await this.tagDao.deleteOnIndexByValue("tag_name", tag_name);
  }
}
