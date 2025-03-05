import express from "express";
import { Config, sendResponse } from "../config";

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

metadataRouter.get("/locations", async (req: any, res) => {
  const response = await Config.dependencies.locationHandler.getLocationsForCampus(
    req.auth
  );
  sendResponse(res, response);
});

