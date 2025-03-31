import express from "express";
import { Config } from "../config";
import { sendResponse } from "../utils/utils";
import SuccessResponse from "../response/SuccessResponse"

export const inventoryRouter = express.Router();

inventoryRouter.post("/checkout", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.checkoutHandler.checkout(req.body, req.auth));
});

inventoryRouter.post("/checkin", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.checkoutHandler.checkin(req.body, req.auth));
});

inventoryRouter.post('/addBook', async (req, res) => {
  // TODO: using a new book's data, create an inventory item given a qr
  sendResponse(res, new SuccessResponse('yipee'))
})

inventoryRouter.post("/genre", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.genreTagHandler.addGenre(req.body));
});

inventoryRouter.delete("/genre", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.genreTagHandler.removeGenre(req.body));
});

inventoryRouter.post("/tag", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.genreTagHandler.addTag(req.body, req.auth));
});

inventoryRouter.delete("/tag", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.genreTagHandler.removeTag(req.body));
});

inventoryRouter.post("/setLocation", async (req: any, res) => {
  sendResponse(
    res,
    await Config.dependencies.locationHandler.setBookLocationInInventory(req.body, req.auth)
  );
});

module.exports = { inventoryRouter };
