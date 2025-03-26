import AudienceDao from "../db/dao/AudienceDao";
import DaoFactory from "../db/dao/DaoFactory";
import CampusDao from "../db/dao/CampusDao";

export default class FilterTypeRoutesHandler {
  private readonly audienceDao: AudienceDao;
  private readonly campusDao: CampusDao;

  constructor(daoFactory: DaoFactory) {
    this.audienceDao = daoFactory.getAudienceDao();
    this.campusDao = daoFactory.getCampusDao();
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

  async getCampuses(): Promise<string[]> {
    const result = await this.campusDao.getAll();

    if (result.statusCode != 200 || result.object == null) {
      throw new Error(
        `Error retrieving data from the Campuses table: ${result.statusCode}: ${result.message}`
      );
    }

    console.log(result.object);

    return result.object.map((item) => {
      return item.campus_name;
    });
  }
}
