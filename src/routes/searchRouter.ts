import express from "express";
import { Config } from "../config";

const searchRouter = express.Router();

searchRouter.get("/query/:searchQuery", async (req, res) => {
  try {
    console.log("Handling call to /search with query " + req.params.searchQuery);
    console.log(`Query Auth: ${JSON.stringify(req.auth)}`);
    const results = await Config.dependencies.searchRouteHandler.conductSearch(
      req.params.searchQuery,
      req.auth.userRole.campus
    );
    res.send({ results });
    console.log("Call to /search complete");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message})
  }
});

searchRouter.get("/cover/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params as { isbn: string };
    console.log("Handling call to /cover/" + isbn);
    console.log(`Query Auth: ${req.auth}`);
    if (isbn === "none") {
      res.status(200).send();
    } else {
      const results = await Config.dependencies.coverImageRouteHandler.relayImage(isbn);
      res.send(results);
      console.log(`Call to /cover/${isbn} completed successfully.`);
    }
  } catch (error) {
    res.status(500).send({ error: error.message})
    console.log("FAILURE: Call to /cover/:isbn failed for some reason");
  }
});

searchRouter.get("/genres", async (req, res) => {
  try {
    const genres = await Config.dependencies.filterTypeRoutesHandler.getGenres()

    if (genres != null && genres.length > 0) {
      res.send({ results: genres })
    }
  } catch (error) {
    res.status(500).send({ error: error.message})
  }
})

searchRouter.get("/audiences", async (req, res) => {
  try {
    const genres = await Config.dependencies.filterTypeRoutesHandler.getAudiences()

    if (genres != null && genres.length > 0) {
      res.send({ results: genres })
    }
  } catch (error) {
    res.status(500).send({ error: error.message})
  }
})

module.exports = { searchRouter };
