import express from "express";
import { Config } from "../config";
import { sendResponse } from "../utils/utils";

export const inventoryRouter = express.Router();

// inventoryRouter.put("/insert", async (req, res) => {
//   if (validateUserType(req, res, "Admin")) {
//     sendResponse(res, await Config.dependencies.inventoryHandler.insertBook(req.body));
//   }
// });

// // Route to get all data for a given book by ISBN
// inventoryRouter.get("/get/:isbn", async (req, res) => {
//   const inventoryResponse = await Config.dependencies.inventoryHandler.getByIsbn(
//     req.params.isbn,
//     req
//   );
//   if (inventoryResponse.statusCode === 200 && inventoryResponse.object) {
//     // return current information for book in inventory
//     sendResponse(res, inventoryResponse);
//     return;
//   } else {
//     sendResponse(res, new SuccessResponse("No Books Found", {}));
//   }
// });

// inventoryRouter.get("/get/tags/:isbn", async (req, res) => {
//   const tagsResponse = await Config.dependencies.inventoryHandler.getTagsByIsbn(
//     req?.params
//   );

inventoryRouter.post("/checkout", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.checkoutHandler.checkout(req.body, req.auth));
});

inventoryRouter.post("/checkin", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.checkoutHandler.checkin(req.body, req.auth));
});

inventoryRouter.post("/genre", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.genreTagHandler.addGenre(req.body, req.auth));
});

inventoryRouter.delete("/genre", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.genreTagHandler.removeGenre(req.body, req.auth));
});

inventoryRouter.post("/tag", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.genreTagHandler.addTag(req.body, req.auth));
});

inventoryRouter.delete("/tag", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.genreTagHandler.removeTag(req.body, req.auth));
});

inventoryRouter.post("/setLocation", async (req: any, res) => {
  sendResponse(
    res,
    await Config.dependencies.locationHandler.setBookLocationInInventory(req.body, req.auth)
  );
});

module.exports = { inventoryRouter };
