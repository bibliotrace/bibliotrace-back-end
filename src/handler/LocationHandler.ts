import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import { Campus } from "../db/schema/Campus";
import { Location } from "../db/schema/Location";
import LocationService from "../service/LocationService";
import SuccessResponse from "../response/SuccessResponse";
import BookManagementService from "../service/BookManagementService";
import { parseQr } from "../utils/utils";

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

  public async addNewLocation(authData, locationName): Promise<Response<any>> {
    if (!authData.userRole?.campus) {
      return new RequestErrorResponse("Missing Campus Data in Authentication", 400);
    }
    if (!authData.userRole?.roleType) {
      return new RequestErrorResponse("Missing UserRole Auth Data", 400);
    }
    if (authData.userRole?.roleType !== "Admin") {
      return new RequestErrorResponse("Only Admins are allowed to do this", 403);
    }
    if (locationName == null) {
      return new RequestErrorResponse("Missing new location name in body {locationName}", 400);
    }

    return await this.locationService.addNewLocationForCampus(
      locationName,
      authData.userRole.campus
    );
  }

  public async updateLocation(authData, locationId, locationName): Promise<Response<any>> {
    if (!authData.userRole?.roleType) {
      return new RequestErrorResponse("Missing UserRole Auth Data", 400);
    }
    if (authData.userRole?.roleType !== "Admin") {
      return new RequestErrorResponse("Only Admins are allowed to do this", 403);
    }
    if (locationName == null) {
      return new RequestErrorResponse("Missing new location name in body {locationName}", 400);
    }

    return await this.locationService.updateLocation(locationId, locationName);
  }

  public async setBookLocationInInventory(body, auth): Promise<Response<any>> {
    console.log(body, auth);
    if (!body.qr_code) {
      return new RequestErrorResponse("Request is missing QR");
    }
    if (!body.location_id) {
      return new RequestErrorResponse("Request is missing location ID");
    }
    if (!auth.userRole?.roleType) {
      return new RequestErrorResponse("Missing UserRole Auth Data");
    }

    const qrResponse = parseQr(body.qr_code);
    if (qrResponse) return qrResponse;

    const targetBook = await this.bookManagementService.getByQr(body.qr_code);
    if (!targetBook.object) {
      return new RequestErrorResponse(
        `Book corresponding to QR code ${body.qr_code} not found. Please scan a valid QR code.`,
        404
      );
    }

    if (auth.userRole.roleType === "Admin") {
      return new SuccessResponse(
        // TODO: if this breaks make sure that the location_id is a number cause I changed the function signatures to match that assumption
        (await this.bookManagementService.setLocationByQr(body.qr_code, body.location_id))._message,
        targetBook
      );
    }

    return new SuccessResponse("Completed", targetBook);
  }

  public async deleteLocation(locationId: string): Promise<Response<any>> {
    if (!locationId) {
      return new RequestErrorResponse("Missing location ID");
    } else if (Number.isNaN(Number(locationId))) {
      return new RequestErrorResponse("Invalid location ID provided");
    }

    return await this.locationService.deleteLocation(Number(locationId));
  }
}
