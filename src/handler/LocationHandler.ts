import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import { Campus } from "../db/schema/Campus";
import { Location } from "../db/schema/Location";
import LocationService from "../service/LocationService";
import SuccessResponse from "../response/SuccessResponse";

export default class LocationHandler {
  locationService: LocationService;

  constructor(locationService: LocationService) {
    this.locationService = locationService;
  }

  public async getLocationsForCampus(authData): Promise<Response<Campus | Location[]| string>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }

    const locationResponse = await this.locationService.getLocationsForCampus(
      authData.userRole.campus
    );
    return locationResponse;
  }

  public async addNewLocation(authData, newLocationName): Promise<Response<any>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400); 
    }
    if (!authData.userRole?.roleType) {
      return new RequestErrorResponse("Missing UserRole Auth Data", 400); 
    }
    if (authData.userRole?.roleType !== 'Admin') {
      return new RequestErrorResponse("Only Admins are allowed to do this", 403);
    }

    const locationResponse = await this.locationService.addNewLocationForCampus(
      newLocationName,
      authData.userRole.campus
    );
    return locationResponse;

    return new SuccessResponse(newLocationName)
  }
}
