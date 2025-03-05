import express from "express";
import { Config } from "../config";
import { sendResponse, validateUserType } from "../utils/utils";
import SuccessResponse from "../response/SuccessResponse";

export const inventoryRouter = express.Router();

inventoryRouter.put("/insert", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.inventoryHandler.insertBook(req.body));
  }
});

inventoryRouter.get("/get/:isbn", async (req, res) => {
  const inventoryResponse = await Config.dependencies.inventoryHandler.getByIsbn(
    req.params
  );
  if (inventoryResponse.statusCode === 200 && inventoryResponse.object) {
    // return current information for book in inventory
    sendResponse(res, inventoryResponse);
    return;
  } else {
    if (validateUserType(req, null, "Admin")) {
      console.log("ISBN not found in inventory, searching ISBNdb...");
      sendResponse(
        res,
        await Config.dependencies.searchRouteHandler.retrieveMetadataForIsbn(req.params)
      );
    } else {
      sendResponse(res, new SuccessResponse('No Books Found', { }))
    }
  }
});

inventoryRouter.post("/checkout", async (req: any, res) => {
  sendResponse(
    res,
    await Config.dependencies.checkoutHandler.checkout(req.body, req.auth)
  );
});

inventoryRouter.post("/checkin", async (req: any, res) => {
  sendResponse(
    res,
    await Config.dependencies.checkoutHandler.checkin(req.body, req.auth)
  );
});

// TODO: write set book location endpoint

module.exports = { inventoryRouter };
