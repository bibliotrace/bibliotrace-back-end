import DaoFactory from "../db/dao/DaoFactory";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import { Campus } from "../db/schema/Campus";
import { Location } from "../db/schema/Location";
import Service from "./Service";

export default class LocationService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async getLocationsForCampus(
    campus_name: string
  ): Promise<Response<Campus | Location[] | string>> {
    const campus_response = (await this.getCampus(campus_name)) as any;
    if (campus_response.statusCode !== 200) {
      return campus_response;
    }

    const locationResponse = await this.locationDao.getAllByKeyAndValue(
      "campus_id",
      campus_response.object.id.toString()
    );
    return locationResponse;
  }

  public async addNewLocationForCampus(newLocationName, campusName) {
    const campus_response = (await this.getCampus(campusName)) as any;
    if (campus_response.statusCode !== 200) {
      return campus_response;
    }

    try {
      await this.locationDao.create({
        campus_id: campus_response.object.id,
        location_name: newLocationName,
      });
      return new SuccessResponse(`Successfully Added ${newLocationName}`)
    } catch (error) {
      console.error(error)
      return new ServerErrorResponse('Error in locationCreate', 500)
    }
    
  }

  private async getCampus(campusName: string) {
    const campus_response = await this.campusDao.getByKeyAndValue(
      "campus_name",
      campusName
    );
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(
        `Could not find campus with name: ${campusName}`,
        500
      );
    }
    return campus_response;
  }
}
