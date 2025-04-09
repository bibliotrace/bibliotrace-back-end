import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import { AuthService } from "../service/AuthService";
import { parseRequiredFields } from "../utils/utils";

export class AuthHandler {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public async login(body): Promise<Response<string>> {
    const requiredFields = ["username", "password"];
    const requiredFieldsResponse = parseRequiredFields(body, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

    return this.authService.login(body.username, body.password);
  }

  public async createUser(body) {
    const requiredFields = ["username", "password", "email", "roleType", "campus"];
    const requiredFieldsResponse = parseRequiredFields(body, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new RequestErrorResponse("Email is not valid");
    }

    return this.authService.createUser(body.username, body.password, {
      campus: body.campus,
      roleType: body.roleType,
      email: body.email,
    });
  }

  public async updateUser(body): Promise<Response<string | number>> {
    const requiredFields = ["username"];
    const requiredFieldsResponse = parseRequiredFields(body, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

    return this.authService.updateUser(
      body.username,
      body.password,
      body.roleType,
      body.email,
      body.campus
    );
  }

  public async deleteUser(params): Promise<Response<string>> {
    const requiredFields = ["username"];
    const requiredFieldsResponse = parseRequiredFields(params, requiredFields);
    if (requiredFieldsResponse) return requiredFieldsResponse;

    return this.authService.deleteUser(params.username);
  }
}

export interface UserJWTData {
  campus: string;
  roleType: string;
  email: string;
}
