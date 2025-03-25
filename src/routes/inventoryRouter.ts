import express from "express";
import { Config } from "../config";
import { sendResponse, validateUserType } from "../utils/utils";
import SuccessResponse from "../response/SuccessResponse";
import RequestErrorResponse from "../response/RequestErrorResponse";

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

//   if (tagsResponse.statusCode === 200 && tagsResponse.object) {
//     sendResponse(res, tagsResponse);
//     return;
//   } else {
//     sendResponse(res, new RequestErrorResponse("Book Not Found", 404));
//   }
// });



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

inventoryRouter.post("/setLocation", async (req: any, res) => {
  sendResponse(
    res,
    await Config.dependencies.locationHandler.setBookLocationInInventory(req.body, req.auth)
  );
});

module.exports = { inventoryRouter };
