import GenreTypeDao from "../db/dao/GenreTypeDao";
import AudienceDao from "../db/dao/AudienceDao";
import DaoFactory from "../db/dao/DaoFactory";

export default class FilterTypeRoutesHandler {
  private readonly genretypeDao: GenreTypeDao;
  private readonly audienceDao: AudienceDao;

  constructor(daoFactory: DaoFactory) {
    this.audienceDao = daoFactory.getAudienceDao();
    this.genretypeDao = daoFactory.getGenreTypeDao();
  }

  async getGenres(): Promise<string[]> {
    const result = await this.genretypeDao.getAll();

    if (result.statusCode != 200 || result.object == null) {
      throw new Error(
        `Error retrieving data from the Genres table: ${result.statusCode}: ${result.message}`
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
        `Error retrieving data from the Genres table: ${result.statusCode}: ${result.message}`
      );
    }

    console.log(result.object);

    return result.object.map((item) => {
      return item.audience_name;
    });
  }
}
