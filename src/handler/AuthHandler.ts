import Response from "../db/response/Response";
import RequestErrorResponse from "../db/response/RequestErrorResponse";
import { AuthService } from "../service/AuthService";

export class AuthHandler {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  public async login(body: any): Promise<Response<any>> {
    if (!body.username) {
      return new RequestErrorResponse("Username is required", 400);
    }
    if (!body.password) {
      return new RequestErrorResponse("Password is required", 400);
    }

    return this.authService.login(body.username, body.password);
  }

  public async createUser(body: any): Promise<Response<any>> {
    if (!body.username) {
      return new RequestErrorResponse("Username is required", 400);
    }
    if (!body.password) {
      return new RequestErrorResponse("Password is required", 400);
    }
    if (!body.email) {
      return new RequestErrorResponse("Email is required", 400);
    }
    if (!body.roleType) {
      return new RequestErrorResponse("Role Type is required", 400);
    }
    if (!body.campus) {
      return new RequestErrorResponse("Campus is required", 400);
    }

    return this.authService.createUser(body.username, body.password, {
      campus: body.campus,
      roleType: body.roleType,
      email: body.email,
    });
  }

  public async updateUser(body: any): Promise<Response<any>> {
    if (!body.username) {
      return new RequestErrorResponse("Username is required", 400);
    }

    return this.authService.updateUser(
      body.username,
      body.password,
      body.roleType,
      body.email,
      body.campus
    );
  }

  public async deleteUser(params: any): Promise<Response<any>> {
    if (!params.username) {
      return new RequestErrorResponse("Username is required", 400);
    }

    return this.authService.deleteUser(params.username);
  }
}

export interface UserJWTData {
  campus: string;
  roleType: string;
  email: string;
}
