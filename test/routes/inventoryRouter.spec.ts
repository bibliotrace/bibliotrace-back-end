import request from "supertest";
import express from "express";
import { inventoryRouter } from "../../src/routes/inventoryRouter";
import { Config } from "../../src/config";
import Response from "../../src/response/Response"; 
import SuccessResponse from "../../src/response/SuccessResponse";
import ServerErrorResponse from "../../src/response/ServerErrorResponse";
import {validateUserType} from "../../src/utils/utils"
import * as utils_1 from "../../src/utils/utils";
jest.mock("../../src/config", () => ({
  Config: {
    dependencies: {
      inventoryHandler: {
        insertBook: jest.fn(),
        getByIsbn: jest.fn(),
        getTagsByIsbn: jest.fn(),
      },
      checkoutHandler: {
        checkout: jest.fn(),
        checkin: jest.fn(),
      },
    },
  },
}));

const app = express();
app.use(express.json());
app.use("/inventory", inventoryRouter);

// describe("PUT /insert", () => {
//   it("should return a successful insert book response", async () => {
//     const mockQRCode = "aa4444";
//     const mockInsertResponse = new SuccessResponse("Book inserted successfully", null);
//     jest.spyOn(utils_1, "validateUserType").mockReturnValue(true);
    
//     jest.spyOn(Config.dependencies.inventoryHandler, "insertBook").mockResolvedValue(mockInsertResponse as Response<string>);

//     const response = await request(app)
//       .put("/inventory/insert")
//       .send(mockQRCode);

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({
//       message: "Book inserted successfully",
//       object: null,
//     });
//   });
// });


// describe("GET /get/tags/:isbn", () => {
//   it("should return a successful get book by ISBNdb and tag response", async () => {
//     const mockISBN = "1338878921";
//     const mockISBNTagGetResponse = new SuccessResponse("Successfully retrieved book with isbn and tag", null);
//     jest.spyOn(utils_1, "validateUserType").mockReturnValue(true);
//     // Mock the login method
//     jest.spyOn(Config.dependencies.inventoryHandler, "getTagsByIsbn").mockResolvedValue(mockISBNTagGetResponse as Response<string>);

//     const response = await request(app)
//       .get(`/inventory/get/tags/${mockISBN}`)
//       .send(mockISBN);

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({
//       message: "Successfully retrieved book with isbn and tag",
//       object: null,
//     });
//   });
// });

describe("POST /checkout", () => {
  it("should return a successful book checkout response", async () => {
    const mockCheckoutResponse = new SuccessResponse("Book checkouted successfully", null);
    
    jest.spyOn(Config.dependencies.checkoutHandler, "checkout").mockResolvedValue(mockCheckoutResponse as Response<string>);

    const response = await request(app)
      .post("/inventory/checkout")
      .send("test", "test");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Book checkouted successfully",
      object: null,
    });
  });
});

describe("POST /checkin", () => {
  it("should return a successful book checkin response", async () => {
    const mockCheckinResponse = new SuccessResponse("Book checkin successfully", null);
    
    jest.spyOn(Config.dependencies.checkoutHandler, "checkin").mockResolvedValue(mockCheckinResponse as Response<string>);

    const response = await request(app)
      .post("/inventory/checkin")
      .send("test", "test");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Book checkin successfully",
      object: null,
    });
  });
});

// describe("GET /get/:isbn", () => {
//   it("should return a successful get book by ISBNdb response", async () => {
//     const mockISBN = "1338878921";
//     const mockISBNGetResponse = new SuccessResponse("Successfully retrieved book with isbn", null);
//     jest.spyOn(utils_1, "validateUserType").mockReturnValue(true);
//     // Mock the login method
//     jest.spyOn(Config.dependencies.inventoryHandler, "getByIsbn").mockResolvedValue(mockISBNGetResponse as Response<string>);

//     const response = await request(app)
//       .get(`/inventory/get/${mockISBN}`)
//       .send(mockISBN);

//     expect(response.status).toBe(200);
//     expect(response.body).toEqual({
//       message: "Successfully retrieved book with isbn",
//       object: null,
//     });
//   });
// });