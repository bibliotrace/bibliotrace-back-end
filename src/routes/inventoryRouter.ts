import express from "express";
import { Config } from "../config";
import { sendResponse, validateUserType } from "../utils/utils";

export const inventoryRouter = express.Router();

inventoryRouter.post("/checkout", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.checkoutHandler.checkout(req.body, req.auth));
});

inventoryRouter.post('/checkout/bulk', async (req: any, res) => {
  sendResponse(res, await Config.dependencies.checkoutHandler.bulkCheckout(req.body, req.auth));
})

inventoryRouter.post("/checkin", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.checkoutHandler.checkin(req.body, req.auth));
});

inventoryRouter.post("/add-book", async (req: any, res) => {
  sendResponse(
    res,
    await Config.dependencies.checkoutHandler.addBookToInventory(req.body, req.auth)
  );
});

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

inventoryRouter.post("/auditEntry", async (req: any, res) => {
  const [response, book_obj] = await Config.dependencies.auditHandler.auditBook(req.body, req.auth);
  res.send({ message: response.message, object: book_obj });
});

inventoryRouter.post("/audit", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.auditHandler.startAudit(req.auth));
});

inventoryRouter.get("/audit", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.auditHandler.getCurrentAudit(req.auth));
});

inventoryRouter.post("/audit/completeLocation", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.auditHandler.completeLocation(req.body, req.auth));
});

inventoryRouter.post("/audit/complete", async (req: any, res) => {
  sendResponse(res, await Config.dependencies.auditHandler.completeAudit(req.body, req.auth));
});

inventoryRouter.delete("/audit", async (req: any, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.auditHandler.deleteAudit(req.body));
  }
});

inventoryRouter.delete("/delete/isbn", async (req: any, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.inventoryHandler.removeBookByIsbn(req.body));
  }
});

inventoryRouter.delete("/delete/qr", async (req: any, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.inventoryHandler.removeBookByQr(req.body));
  }
});

inventoryRouter.get('/quantities/:bookId', async (req: any, res) => {
  if (validateUserType(req, res, "Admin")) {
    sendResponse(res, await Config.dependencies.inventoryHandler.getQuantities(Number(req.params?.bookId)))
  }
})

module.exports = { inventoryRouter };
