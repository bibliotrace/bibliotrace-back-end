import { sanitizeUrl } from "@braintree/sanitize-url";
import SuccessResponse from "../db/response/SuccessResponse";
import RequestErrorResponse from "../db/response/RequestErrorResponse";
import { Book } from "../db/schema/Book";

class IsbnService {
  async conductSearch(
    inputQuery: string
  ): Promise<SuccessResponse<string[] | unknown> | RequestErrorResponse> {
    const result = await fetch(
      `${process.env.ISBN_HOST}/books/${sanitizeUrl(inputQuery)}?pageSize=1000`,
      {
        method: "GET",
        headers: {
          Authorization: process.env.ISBN_KEY,
        },
      }
    );
    if (!result.ok) {
      if (result.status === 404) {
        //TODO: make a "did you mean response"
        return new SuccessResponse("No Books Found");
      } else {
        return new RequestErrorResponse(
          `Call to ISBNdb Not Ok, status: ${result.status}, body: ${await result.text()}`,
          result.status
        );
      }
    }
    const resultJson = await result.json();

    console.log("CALLED THE ISBNDB!!!!! Parsing the result...");

    const isbnList = [];
    resultJson.books.map((result) => {
      if (result.isbn10 != null) isbnList.push(`${result.isbn10}||${result.image}`);
      if (result.isbn13 != null) isbnList.push(`${result.isbn13}||${result.image}`);
    });

    return new SuccessResponse("Successfully Pulled in ISBNs", isbnList);
  }

  async retrieveMetadata(
    isbn: string
  ): Promise<SuccessResponse<Book | unknown> | RequestErrorResponse> {
    const result = await fetch(`${process.env.ISBN_HOST}/book/${isbn}`, {
      method: "GET",
      headers: {
        Authorization: process.env.ISBN_KEY,
      },
    });
    if (!result.ok) {
      return new RequestErrorResponse(
        `Call to ISBNdb Not Ok, status: ${result.status}, body: ${await result.text()}`,
        result.status
      );
    }
    const resultJson = await result.json();

    if (resultJson.error) {
      return new RequestErrorResponse(
        `Error in ISBNdb response: ${resultJson.error}`,
        result.status
      );
    }

    let book_title: string = resultJson.title ?? resultJson.title_long ?? "Unknown title";
    let isbn_list: string = ""; // this should always exist given that we're querying by isbn here lol
    if (resultJson.isbn && !resultJson.isbn13) {
      isbn_list = resultJson.isbn;
    } else if (resultJson.isbn13 && !resultJson.isbn) {
      isbn_list = resultJson.isbn13;
    } else {
      isbn_list = `${resultJson.isbn}||${resultJson.isbn13}`;
    }
    let author: string;
    if (!resultJson.authors) author = "Unknown author";
    else author = resultJson.authors.join(", ");
    let primary_genre_id: number = -1; // unknown from just ISBN
    let audience_id: number = -1; // unknown from just ISBN
    let pages: number = resultJson.pages ?? -1;
    let series_id: number = -1; // unknown from just ISBN
    let series_number: number = -1; // unknown from just ISBN
    let publish_date: number = resultJson.date_published
      ? new Date(resultJson.date_published).getFullYear()
      : -1;
    let short_description: string = resultJson.synopsis ?? "No short description found";
    let language: string = resultJson.language ?? "Unknown language";
    let img_callback: string = resultJson.image ?? "No image found"; // tbh not sure what is in the json for an image here but we'll find out together

    return new SuccessResponse(`Metadata retrieved for ISBN ${isbn}`, {
      book_title,
      isbn_list,
      author,
      primary_genre_id,
      audience_id,
      pages,
      series_id,
      series_number,
      publish_date,
      short_description,
      language,
      img_callback,
    });
  }
}

export default IsbnService;
