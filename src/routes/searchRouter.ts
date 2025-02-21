import express from "express";
import { Config } from "../config";

export const searchRouter = express.Router();

searchRouter.get("/query/:searchQuery?", async (req, res) => {
  try {
    console.log("Handling call to /search with query " + req.params.searchQuery);
    const authCampus = (req as unknown as CustomRequest).auth.userRole.campus

    const results = await Config.dependencies.searchRouteHandler.conductSearch(
      req.params.searchQuery ?? "",
      authCampus
    );
    res.send({ results });
    console.log("Call to /search complete");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

searchRouter.get("/cover/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params as { isbn: string };
    if (isbn === "none") {
      res.status(200).send();
    } else {
      const results = await Config.dependencies.coverImageRouteHandler.relayImage(isbn);
      res.send(results);
      console.log(`Call to /cover/${isbn} completed successfully.`);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log("FAILURE: Call to /cover/:isbn failed for some reason");
  }
});

searchRouter.get("/genres", async (req, res) => {
  try {
    const genres = await Config.dependencies.filterTypeRoutesHandler.getGenres();

    if (genres != null && genres.length > 0) {
      res.send({ results: genres });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

searchRouter.get("/audiences", async (req, res) => {
  try {
    const genres = await Config.dependencies.filterTypeRoutesHandler.getAudiences();

    if (genres != null && genres.length > 0) {
      res.send({ results: genres });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = { searchRouter };

interface CustomRequest extends Request {
  auth: {
    userRole: {
      campus: string
    }
  }
}
