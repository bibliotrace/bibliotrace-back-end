import { sanitizeUrl } from "@braintree/sanitize-url";
import SuccessResponse from "../response/SuccessResponse";
import RequestErrorResponse from "../response/RequestErrorResponse";
import { Book } from "../db/schema/Book";
import sanitizeHtml from "sanitize-html";

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
        //TODO: make a "did you mean" response
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

    console.log(isbnList)

    return new SuccessResponse("Successfully Pulled in ISBNs", isbnList);
  }

  async retrieveMetadata(
    isbn: string
  ): Promise<SuccessResponse<Book | unknown> | RequestErrorResponse> {
    console.log('FIRING OFF CALL TO ISBN FOR BOOK DATA')
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

    const book = resultJson.book;
    console.log(book);

    const book_title: string = book.title ?? book.title_long ?? "Unknown title";
    let isbn_list: string = ""; // this should always exist given that we're querying by isbn here lol
    if (book.isbn && !book.isbn13) {
      isbn_list = book.isbn;
    } else if (book.isbn13 && !book.isbn) {
      isbn_list = book.isbn13;
    } else {
      isbn_list = `${book.isbn}||${book.isbn13}`;
    }
    const author: string = book.authors ? book.authors.join(", ") : "Unknown author";
    const primary_genre_id: number = undefined; // unknown from just ISBN
    const audience_id: number = undefined; // unknown from just ISBN
    const pages: number = book.pages ?? -1;
    const series_id: number = undefined; // unknown from just ISBN
    const series_number: number = undefined; // unknown from just ISBN
    const publish_date: number = book.date_published
      ? new Date(book.date_published).getFullYear()
      : -1;
    const short_description: string =
      sanitizeHtml(book.synopsis, {
        allowedTags: [],
        allowedAttributes: {},
      }) ?? "No short description found";
    const language: string = book.language ? this.parseLanguage(book.language) : "Unknown language";
    const img_callback: string = book.image ?? "No image found"; // this just returns the raw URL to the image, which unfortunately has CORS problems when rendered from the frontend

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

  private parseLanguage(language: string): string {
    if (language == "en") return "English";
    if (language == "es") return "Spanish";
    if (language == "fr") return "French";
    if (language == "de") return "German";
    if (language == "it") return "Italian";
    if (language == "pt") return "Portuguese";
    if (language == "nl") return "Dutch";
    if (language == "ja") return "Japanese";
    if (language == "zh") return "Chinese";
    // add more languages as needed
    return "Unknown language";
  }
}

export default IsbnService;
