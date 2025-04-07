import express from "express";
import { Config } from "../config";
import SuccessResponse from "../response/SuccessResponse";
import { sendResponse } from "../utils/utils";

export const searchRouter = express.Router();

searchRouter.get("/query/:searchQuery?", async (req, res) => {
  try {
    console.log("Handling call to /search with query " + req.params.searchQuery);
    const authCampus = (req as unknown as CustomRequest).auth.userRole.campus;

    const results = await Config.dependencies.searchRouteHandler.conductSearch(
      req.params.searchQuery ?? "",
      authCampus
    );
    res.send({ results: results ?? [] });
    console.log("Call to /search complete");
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
});

searchRouter.get("/cover/:isbn", async (req, res) => {
  try {
    // TODO: this endpoint should be more fully refactored to use the new response classes
    // which has better error handling but will require that the frontend look at the object parameter
    // instead of the raw buffer.
    // look at the inventoryRouter for an example of how to use the new response classes
    const results = await Config.dependencies.coverImageRouteHandler.relayImage(req.params);
    if (results instanceof SuccessResponse) sendResponse(res, results);
    res.send(results);
    console.log(`Call to /cover/${req.params.isbn} completed successfully.`);
  } catch (error) {
    res.status(500).send({ error: error.message });
    console.log("FAILURE: Call to /cover/:isbn failed for some reason");
  }
});

module.exports = { searchRouter };

interface CustomRequest extends Request {
  auth: {
    userRole: {
      campus: string;
    };
  };
}
