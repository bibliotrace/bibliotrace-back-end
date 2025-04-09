import DaoFactory from "../db/dao/DaoFactory";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import { Campus } from "../db/schema/Campus";
import { Location } from "../db/schema/Location";
import Service from "./Service";
import RequestErrorResponse from "../response/RequestErrorResponse";

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
      return new SuccessResponse(`Successfully Added ${newLocationName}`);
    } catch (error) {
      console.error(error);
      return new ServerErrorResponse("Error in locationCreate", 500);
    }
  }

  public async updateLocation(locationId, locationName) {
    try {
      await this.locationDao.update(locationId, {
        location_name: locationName,
      });
      return new SuccessResponse(`Successfully updated location ${locationId}: ${locationName}`);
    } catch (error) {
      return new ServerErrorResponse(`Error in updating Location: ${error.message}`, 500);
    }
  }

  public async deleteLocation(locationId: number): Promise<Response<any>> {
    try {
      const locationResponse = await this.locationDao.delete(locationId);
      if (locationResponse.statusCode !== 200) {
        if (
          locationResponse.statusCode === 500 &&
          locationResponse.message.includes("foreign key constraint")
        ) {
          return new RequestErrorResponse(
            `Location is in use by at least one book and cannot be deleted. Please remove all books from this location before deleting it.`
          );
        } else {
          return locationResponse;
        }
      }

      if (locationResponse.message.includes("No location found")) {
        return new RequestErrorResponse(`Location with id ${locationId} does not exist`, 404);
      }

      return new SuccessResponse(`Successfully deleted location`);
    } catch (error) {
      return new ServerErrorResponse(`Error deleting location: ${error.message}`);
    }
  }

  private async getCampus(campusName: string) {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campusName);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object?.id) {
      return new ServerErrorResponse(`Could not find campus with name: ${campusName}`, 500);
    }
    return campus_response;
  }
}
