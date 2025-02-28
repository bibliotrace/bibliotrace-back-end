import express from "express";
import { Config, sendResponse, validateUserType } from "../config";

export const inventoryRouter = express.Router();

inventoryRouter.put("/insert", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.inventoryHandler.insertBook(req.body));
  }
});

inventoryRouter.get("/get/:isbn", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    const inventoryResponse = await Config.dependencies.inventoryHandler.getByIsbn(
      req.params
    );
    if (inventoryResponse.statusCode === 200 && inventoryResponse.object) {
      sendResponse(res, inventoryResponse);
    } else {
      console.log("ISBN not found in inventory, searching ISBNdb...");
      sendResponse(
        res,
        await Config.dependencies.searchRouteHandler.retrieveMetadataForIsbn(req.params)
      );
    }
  } else {
    sendResponse(res, await Config.dependencies.inventoryHandler.getByIsbn(req.params));
  }
});

inventoryRouter.post("/checkout", async (req: any, res) => {
  const response = await Config.dependencies.checkoutHandler.checkout(req.body, req.auth);
  sendResponse(res, response);
});

inventoryRouter.post("/checkin", async (req: any, res) => {
  const response = await Config.dependencies.checkoutHandler.checkin(req.body, req.auth);
  sendResponse(res, response);
});

module.exports = { inventoryRouter };
