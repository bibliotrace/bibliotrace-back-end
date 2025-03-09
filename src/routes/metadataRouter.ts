import express from "express";
import { Config } from "../config";
import { sendResponse } from "../utils/utils";
import SuccessResponse from "../response/SuccessResponse";

export const metadataRouter = express.Router();

metadataRouter.get("/genres", async (req, res) => {
  try {
    const genres = await Config.dependencies.filterTypeRoutesHandler.getGenres();

    if (genres != null && genres.length > 0) {
      res.send({ results: genres });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

metadataRouter.get("/audiences", async (req, res) => {
  try {
    const genres = await Config.dependencies.filterTypeRoutesHandler.getAudiences();

    if (genres != null && genres.length > 0) {
      res.send({ results: genres });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

metadataRouter.get("/campuses", async (req: any, res) => {
  try {
    const response = await Config.dependencies.filterTypeRoutesHandler.getCampuses();

    if (response != null && response.length > 0) {
      res.send({ results: response });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
})


metadataRouter.get("/locations", async (req: any, res) => {
  const response = await Config.dependencies.locationHandler.getLocationsForCampus(req.auth);
  console.log(response)
  sendResponse(res, response);
});

metadataRouter.post('/locations', async (req: any, res) => {
  console.log(req.body)
  const response = await Config.dependencies.locationHandler.addNewLocation(req.auth, req.body.newLocationName);
  sendResponse(res, response);
})

