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
    const inventoryResponse = await Config.dependencies.inventoryHandler.getByIsbn(
      req.params
    );
    if (inventoryResponse.statusCode === 200) {
      sendResponse(res, inventoryResponse);
    } else {
      console.log("ISBN not found in inventory, searching ISBNdb...");
      const isbnSearchResponse =
        await Config.dependencies.searchRouteHandler.retrieveMetadataForIsbn(req.params);
      sendResponse(res, isbnSearchResponse);
    }
  } else {
    const inventoryResponse = await Config.dependencies.inventoryHandler.getByIsbn(
      req.params
    );
    sendResponse(res, inventoryResponse);
  }
});

inventoryRouter.post("/checkout", async (req, res) => {
  if (!req.body.qr_code || !req.body.campus) {
    res.status(400).send("missing qr_code or campus");
  }

  const [response, book_obj] = await Config.dependencies.checkoutService.checkout(
    req.body.qr_code,
    req.body.campus
  );

  res.status(response.statusCode).send(
    JSON.stringify({
      title: book_obj.book_title,
      author: book_obj.author,
    }) ?? response.message
  );
});

module.exports = { inventoryRouter };
