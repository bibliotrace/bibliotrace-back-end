import DaoFactory from "../db/dao/DaoFactory";
import Response from "../db/response/Response";
import ServerErrorResponse from "../db/response/ServerErrorResponse";
import { Campus } from "../db/schema/Campus";
import { Location } from "../db/schema/Location";
import Service from "./Service";

export default class LocationService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async getLocationsForCampus(
    campus_name: string
  ): Promise<Response<Campus | Location[]>> {
    const campus_response = await this.campusDao.getByKeyAndValue(
      "campus_name",
      campus_name
    );
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(
        `Could not find campus with name: ${campus_name}`,
        500
      );
    }

    const locationResponse = await this.locationDao.getAllByKeyAndValue(
      "campus_id",
      campus_response.object.id.toString()
    );
    return locationResponse;
  }
}
