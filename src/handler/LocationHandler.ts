import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import { Campus } from "../db/schema/Campus";
import { Location } from "../db/schema/Location";
import LocationService from "../service/LocationService";

export default class LocationHandler {
  locationService: LocationService;

  constructor(locationService: LocationService) {
    this.locationService = locationService;
  }

  public async getLocationsForCampus(authData): Promise<Response<Campus | Location[]>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }

    const locationResponse = await this.locationService.getLocationsForCampus(
      authData.userRole.campus
    );
    return locationResponse;
  }
}
