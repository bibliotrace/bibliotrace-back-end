import AudienceDao from "../db/dao/AudienceDao";
import CampusDao from "../db/dao/CampusDao";
import DaoFactory from "../db/dao/DaoFactory";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";

export default class FilterTypeRoutesHandler {
  private readonly audienceDao: AudienceDao;
  private readonly campusDao: CampusDao;

  constructor(daoFactory: DaoFactory) {
    this.audienceDao = daoFactory.getAudienceDao();
    this.campusDao = daoFactory.getCampusDao();
  }

  async getAudiences(): Promise<Response<string[]>> {
    const result = await this.audienceDao.getAll();

    if (result.statusCode != 200 || result.object == null) {
      return new ServerErrorResponse(
        `Error retrieving data from the Audience table: ${result.statusCode}: ${result.message}`
      );
    }

    const resultObject = result.object.map(item => item.audience_name).filter(val => val !== 'Unknown')

    return new SuccessResponse(result.message, resultObject);
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
