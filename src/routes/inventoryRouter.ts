import express from "express";
import { Book } from "../db/schema/Book";
import Response from "../response/Response";
import BookManagementService from "../service/BookManagementService";
import { Inventory } from "../db/schema/Inventory";

const inventoryRouter = express.Router();
let bookManagementService: BookManagementService = new BookManagementService();

inventoryRouter.put("/insert", async (req, res) => {
  const response: Response<Book | Inventory> = await bookManagementService.insertBook(
    req
  );
  sendResponse(res, response);
});

inventoryRouter.get("/get/:isbn", async (req, res) => {
  const isbn = req.params.isbn;
  console.log(`ISBN: ${isbn}`);
  const response: Response<Book> = await bookManagementService.getByIsbn(isbn);
  sendResponse(res, response);
});

const sendResponse = (res: any, response: Response<any>): void => {
  const responseBody: any = { message: response.message };
  if (response.object) {
    responseBody.object = response.object;
  }
  res.status(response.statusCode).send(responseBody);
};

module.exports = { inventoryRouter };
