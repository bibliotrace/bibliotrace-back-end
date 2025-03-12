import request from "supertest";
import express from "express";
import { authRouter } from "../../src/routes/authRouter";
import { Config } from "../../src/config";
import Response from "../../src/response/Response";
import SuccessResponse from "../../src/response/SuccessResponse";
import ServerErrorResponse from "../../src/response/ServerErrorResponse";
import {validateUserType} from "../../src/utils/utils"
import * as utils_1 from "../../src/utils/utils";
jest.mock("../../src/config", () => ({
  Config: {
    dependencies: {
      authHandler: {
        login: jest.fn(),
        createUser: jest.fn(),
        updateUser: jest.fn(),
        deleteUser: jest.fn(),
      },
    },
  },
}));

const app = express();
app.use(express.json());
app.use("/auth", authRouter);

describe("POST /auth/login", () => {
  it("should return a successful login response", async () => {
    const mockToken : Object = "fake-jwt-token";
    const mockLoginResponse = new SuccessResponse("Token generated successfully", mockToken );

    // Mock the login method
    jest.spyOn(Config.dependencies.authHandler, "login").mockResolvedValue(mockLoginResponse as Response<string>);

    const response = await request(app)
      .post("/auth/login")
      .send({ username: "testUser", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message:"Token generated successfully",  object: "fake-jwt-token" });
  });
});





describe("POST /auth/user", () => {
  it("should return a successful account create response", async () => {
    const mockAccountDetails = ["username", "password", "email", "roleType", "campus"];
    const mockInsertid = 2;
    const mockCreateAccountResponse = new SuccessResponse("TestUser created successfully", {
      id: mockInsertid,
      entity: mockAccountDetails,
    });

    // Mock validateUserType for this specific test
    jest.spyOn(utils_1, "validateUserType").mockReturnValue(true);  // Ensure it returns `true` for success

    jest.spyOn(Config.dependencies.authHandler, "createUser").mockResolvedValue(mockCreateAccountResponse);

    const response = await request(app)
      .post("/auth/user")
      .send({ username: "testUser", password: "password123", email: "test@gmail.com", roleType: 1, campus: "Lehi" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "TestUser created successfully",
      object: {
        entity: ["username", "password", "email", "roleType", "campus"],
        id: 2,
      }
    });
  });
});

describe("PUT /auth/user", () => {
  it("should return a successful update to a user response", async () => {
    const mockCreateAccountResponse = new SuccessResponse("Successfully Updated User");

    
    jest.spyOn(utils_1, "validateUserType").mockReturnValue(true); 

    jest.spyOn(Config.dependencies.authHandler, "updateUser").mockResolvedValue(mockCreateAccountResponse as Response<string | number>);

    const response = await request(app)
      .put("/auth/user")
      .send({ username: "testUser" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Successfully Updated User",
      object: null
    });
  });
});


describe("DELETE /auth/user/:username", () => {
  it("should delete the user and send a success response", async () => {
    const mockUsername = "testUser";
    const mockDeleteResponse = new SuccessResponse("User deleted successfully", null);

    // Mock validateUserType for this specific test
    jest.spyOn(utils_1, "validateUserType").mockReturnValue(true);  // Ensure it returns `true` for success

    jest.spyOn(Config.dependencies.authHandler, "deleteUser").mockResolvedValue(mockDeleteResponse);

    const response = await request(app)
      .delete(`/auth/user/${mockUsername}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "User deleted successfully",
      object: null,
    });
  });
});
