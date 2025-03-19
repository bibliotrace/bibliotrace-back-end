import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import { Campus } from "../db/schema/Campus";
import { Location } from "../db/schema/Location";
import LocationService from "../service/LocationService";
import SuccessResponse from "../response/SuccessResponse";
import BookManagementService from "../service/BookManagementService";

export default class LocationHandler {
  locationService: LocationService;
  bookManagementService: BookManagementService;

  constructor(locationService: LocationService, bookManagementService: BookManagementService) {
    this.locationService = locationService;
    this.bookManagementService = bookManagementService;
  }

  public async getLocationsForCampus(authData): Promise<Response<Campus | Location[] | string>> {
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
    if (authData.userRole?.roleType !== "Admin") {
      return new RequestErrorResponse("Only Admins are allowed to do this", 403);
    }

    const locationResponse = await this.locationService.addNewLocationForCampus(
      newLocationName,
      authData.userRole.campus
    );

    return locationResponse;
  }

  public async setBookLocationInInventory(body, auth): Promise<Response<any>> {
    console.log(body, auth);

    const targetBook = await this.bookManagementService.getByQr(body.qr_code);
    if (auth.userRole.roleType === "Admin") {
      return new SuccessResponse(
        // TODO: if this breaks make sure that the location_id is a number cause I changed the function signatures to match that assumption
        (await this.bookManagementService.setLocationByQr(body.qr_code, body.location_id))._message,
        targetBook
      );
    }

    return new SuccessResponse("Completed", targetBook);
  }
}
