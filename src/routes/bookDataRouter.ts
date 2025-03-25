import express from "express";
import { sendResponse } from "../utils/utils";
import { Config } from "../config";
import SuccessResponse from "../response/SuccessResponse";
import { Request as JWTRequest } from "express-jwt";

export const bookDataRouter = express.Router();

// Get all book data from the db if it exists, return 404 otherwise
/*
Output: {
 "message": "success or otherwise",
 "object": {
  "id",
  "book_title",
  "isbn_list",
  "author",
  "primary_genre_id",
  "audience_id",
  "pages",
  "series_id",
  "series_number",
  "publish_date",
  "short_description",
  "language",
  "img_callback",
  "audience_name",
  "primary_genre_name",
  "series_name",
  "tag_list": ["tag1", "tag2", ...],
  "genre_list": ["genre1", "genre2", "genre3"]
  }
 } */
bookDataRouter.get("/:isbn", async (req, res) => {
  sendResponse(res, await Config.dependencies.bookDataHandler.getByIsbn(req.params.isbn));
});

// Ask the ISBNdb for data associated with an isbn number
/* Output: {
  "message": "success or otherwise", 
  "object": {
    "book_title",
    "isbn_list",
    "author", 
    "pages", 
    "publish_date", 
    "short_description", 
    "language", 
    "img_callback"
  }
}
*/
bookDataRouter.get("/suggest/:isbn", async (req: JWTRequest, res) => {
  console.log(req.auth)
  sendResponse(res, await Config.dependencies.bookDataHandler.getIsbnDbSuggestion(req.params.isbn, req.auth.userRole.roleType))
});

// Update an existing book's metadata
/* Input: {

} Output: {
  message: success or failure
}
*/
bookDataRouter.put("/:isbn", (req, res) => {
  sendResponse(res, new SuccessResponse("dummy")); // await Config.bookDataHandler.something)
});

// Create a new book in the db
/* Input: {

} Output: {
  message: success or failure
}
*/
bookDataRouter.post("/:isbn", (req, res) => {
  sendResponse(res, new SuccessResponse("dummy")); // await Config.bookDataHandler.something)
});

module.exports = { bookDataRouter };
