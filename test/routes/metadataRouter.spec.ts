import request from "supertest";
import express from "express";
import { metadataRouter } from "../../src/routes/metadataRouter"; // Adjust the path if needed
import { Location } from "../../src/db/schema/Location";
import { Campus } from "../../src/db/schema/Campus";
import Response from "../../src/response/Response";
// Mock the Config.dependencies.filterTypeRoutesHandler.getGenres
jest.mock("../../src/config", () => ({
  Config: {
    dependencies: {
      filterTypeRoutesHandler: {
        getGenres: jest.fn(),
        getAudiences: jest.fn(),
        getCampuses: jest.fn(),
      },
      locationHandler:{
        getLocationsForCampus: jest.fn(),
      }
    },
  },
}));
import { Config } from "../../src/config";
const app = express();
app.use(express.json());
app.use("/metadata", metadataRouter); // Attach the router to a base path

describe("GET /metadata/genres", () => {
  it("should return a list of genres", async () => {
    const mockGenres = ["Action", "Drama", "Comedy"];
    
    jest.spyOn(Config.dependencies.filterTypeRoutesHandler, "getGenres").mockResolvedValue(mockGenres);


    const response = await request(app).get("/metadata/genres");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ results: mockGenres });
  });

  it("should return a 500 error if getGenres throws an error", async () => {
    jest.spyOn(Config.dependencies.filterTypeRoutesHandler, "getGenres").mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/metadata/genres");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error" });
  });
});

 describe("GET /metadata/audiences", ()=> {
  it("should return list of audiences", async() =>{
    const mockAudiences = ["0-2","2-4","6-8"];
    jest.spyOn(Config.dependencies.filterTypeRoutesHandler, "getAudiences").mockResolvedValue(mockAudiences);
    const response = await request(app).get("/metadata/audiences");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({results:mockAudiences});
  });
  
  it("should return a 500 error if getAudiences throws an error", async() => {
    jest.spyOn(Config.dependencies.filterTypeRoutesHandler, "getAudiences").mockRejectedValue(new Error("Database error"));
    const response = await request(app).get("/metadata/genres");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error"});
  });
 });

 describe("GET /metadata/campuses", () =>{
  it("should return list of campuses", async()=>{
    const mockCampuses = ["Lehi", "Salt Lake", "Las Vegas"];
    jest.spyOn(Config.dependencies.filterTypeRoutesHandler, "getCampuses").mockResolvedValue(mockCampuses);
    const response = await request(app).get("/metadata/campuses");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({results:mockCampuses});
  });

  it("should return a 500 error if getCampuses throws an error", async()=> {
    jest.spyOn(Config.dependencies.filterTypeRoutesHandler, "getCampuses").mockRejectedValue(new Error("Database error"));
    const response = await request(app).get("/metadata/campuses");
    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: "Database error"});
  });

 });

 describe("GET /metadata/locations", () => {
  it("should return a list of locations", async () => {
    const mockLocations: Location[] = [
      { id: 1, campus_id: 100,  location_name: "Upstairs"},
      { id: 2, campus_id: 100, location_name: "Downstairs" },
      { id: 3, campus_id: 100, location_name: "Box1" },
    ];

    const mockResponse = { object: mockLocations, statusCode: 200 } as Response<Campus | Location[]>;

    jest.spyOn(Config.dependencies.locationHandler, "getLocationsForCampus")
      .mockResolvedValue(mockResponse);
    const response = await request(app).get("/metadata/locations");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ object: mockLocations });
  });
});
