import express from "express";
import { Book } from "../db/schema/Book";
import Response from "../db/response/Response";
import { Config } from "../config";
import { Inventory } from "../db/schema/Inventory";

const inventoryRouter = express.Router();

inventoryRouter.put("/insert", async (req, res) => {
  const response: Response<Book | Inventory> =
    await Config.dependencies.bookManagementService.insertBook(req);
  sendResponse(res, response);
});

inventoryRouter.get("/get/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  console.log(`ISBN: ${isbn}`);
  const response: Response<Book> =
    await Config.dependencies.bookManagementService.getByIsbn(isbn);
  sendResponse(res, response);
});

const sendResponse = (res: any, response: Response<any>): void => {
  const responseBody: any = { message: response.message };
  if (response.object) {
    responseBody.object = response.object;
  }
  res.status(response.statusCode).send(responseBody);
};

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
      title: book_obj.name,
      author: book_obj.author,
    }) ?? response.message
  );
});

module.exports = { inventoryRouter };
