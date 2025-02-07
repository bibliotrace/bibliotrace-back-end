import express from "express";
import Config from "../config";

const searchRouter = express.Router();

searchRouter.get("/:searchQuery", async (req, res) => {
  try {
    console.log(
      "Handling call to /search with query " + req.params.searchQuery
    );
    console.log(`Query Auth: ${await JSON.stringify(req.auth)}`);
    const results = await Config.dependencies.searchRouteHandler.conductSearch(
      req.params.searchQuery
    );
    res.send(results);
    console.log("Call to /search complete");
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

searchRouter.get("/cover/:isbn", async (req, res) => {
  try {
    const { isbn } = req.params;
    console.log("Handling call to /cover/" + isbn);
    console.log(`Query Auth: ${req.auth}`);
    if (isbn === "none") {
      res.status(200).send();
    } else {
      const results =
        await Config.dependencies.coverImageRouteHandler.relayImage(isbn);
      res.send(results);
      console.log(`Call to /cover/${isbn} completed successfully.`);
    }
  } catch (error) {
    res.status(500).send(error);
    console.log("FAILURE: Call to /cover/:isbn failed for some reason");
  }
});

module.exports = { searchRouter };
