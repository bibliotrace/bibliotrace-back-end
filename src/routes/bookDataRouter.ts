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
  console.log(req.auth);
  sendResponse(
    res,
    await Config.dependencies.bookDataHandler.getIsbnDbSuggestion(req.params.isbn, req.auth.userRole.roleType)
  );
});

// Update a book's metadata, whether or not it exists in the db
/* Input: {
{
  "book_title",
  "isbn_list",
  "author",
  "primary_genre",
  "audience",
  "pages",
  "series_name",
  "series_number",
  "publish_date",
  "short_description",
  "language",
  "img_callback",
  }
} Output: {
  message: success or failure
}
*/
bookDataRouter.put("/:isbn", async (req: JWTRequest, res) => {
  sendResponse(res, await Config.dependencies.bookDataHandler.updateBook(req.body, req.auth.userRole.roleType)); // await Config.bookDataHandler.something)
});

// Add an entry to a book's secondary genres
/* Input: {
{
  "genre": "Fantasy"
  }
} Output: {
  message: success or failure
}
*/
bookDataRouter.put('/genre-list/:isbn', async (req: JWTRequest, res) => {
  sendResponse(res, await Config.dependencies.bookDataHandler.addGenreToBook(req.body.genre, req.params.isbn, req.auth.userRole.roleType))
})

// Delete an entry in a book's secondary genres
/* Input: {
{
  "genre": "Fantasy"
  }
} Output: {
  message: success or failure
}
*/
bookDataRouter.delete('/genre-list/:isbn', async (req: JWTRequest, res) => {
  sendResponse(res, await Config.dependencies.bookDataHandler.deleteGenreFromBook(req.body.genre, req.params.isbn, req.auth.userRole.roleType))
})

// Add an entry to a book's tag list
/* Input: {
{
  "tag": "Harry Potter"
  }
} Output: {
  message: success or failure
}
*/
bookDataRouter.put('/tag-list/:isbn', async (req: JWTRequest, res) => {
  sendResponse(res, await Config.dependencies.bookDataHandler.addTagToBook(req.body.tag, req.params.isbn, req.auth.userRole.roleType))
})

// Delete an entry from a book's tag list
/* Input: {
{
  "tag": "Harry Potter"
  }
} Output: {
  message: success or failure
}
*/
bookDataRouter.delete('/tag-list/:isbn', async (req: JWTRequest, res) => {
  sendResponse(res, await Config.dependencies.bookDataHandler.deleteTagFromBook(req.body.tag, req.params.isbn, req.auth.userRole.roleType))
})

module.exports = { bookDataRouter };
