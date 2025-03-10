import AudienceDao from "../db/dao/AudienceDao";
import DaoFactory from "../db/dao/DaoFactory";
import GenreDao from "../db/dao/GenreDao";

export default class FilterTypeRoutesHandler {
  private readonly genreDao: GenreDao;
  private readonly audienceDao: AudienceDao;

  constructor(daoFactory: DaoFactory) {
    this.audienceDao = daoFactory.getAudienceDao();
  }

  async getGenres(): Promise<string[]> {
    const result = await this.genreDao.getAll();

    if (result.statusCode != 200 || result.object == null) {
      throw new Error(
        `Error retrieving data from the Genre table: ${result.statusCode}: ${result.message}`
      );
    }

    console.log(result.object);

    return result.object.map((item) => {
      return item.genre_name;
    });
  }

  async getAudiences(): Promise<string[]> {
    const result = await this.audienceDao.getAll();

    if (result.statusCode != 200 || result.object == null) {
      throw new Error(
        `Error retrieving data from the Audience table: ${result.statusCode}: ${result.message}`
      );
    }

    console.log(result.object);

    return result.object.map((item) => {
      return item.audience_name;
    });
  }
}
