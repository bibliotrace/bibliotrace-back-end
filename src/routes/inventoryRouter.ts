import express from "express";
import { Config, sendResponse, validateUserType } from "../config";

export const inventoryRouter = express.Router();

inventoryRouter.put("/insert", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    const response = await Config.dependencies.inventoryHandler.insertBook(req.body);
    sendResponse(res, response);
  }
});

inventoryRouter.get("/get/:isbn", async (req, res) => {
  if (validateUserType(req, res, "Admin")) {
    const response = await Config.dependencies.inventoryHandler.getByIsbn(req.params);
    sendResponse(res, response);
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

inventoryRouter.get("/locations", async (req, res) => {
  const response = await Config.dependencies.locationHandler.getLocationsForCampus(
    req.auth
  );
  sendResponse(res, response);
});

module.exports = { inventoryRouter };
