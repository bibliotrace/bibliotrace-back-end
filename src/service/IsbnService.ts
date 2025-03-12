import { sanitizeUrl } from "@braintree/sanitize-url";
import SuccessResponse from "../response/SuccessResponse";
import RequestErrorResponse from "../response/RequestErrorResponse";
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
    const book = resultJson.book;

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
    const publish_date: number = (book.date_published.length > 4) ? new Date(book.date_published).getFullYear() : book.date_published;
    const short_description: string =
      book.synopsis.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ") ??
      "No description found"; // sanitizeHtml does not replace self-closing tags
    const language: string = book.language ? this.parseLanguage(book.language) : "Unknown language";
    const img_callback: string = book.image ?? "No image found"; 

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
    const languages = {
      en: "English",
      es: "Spanish",
      fr: "French",
      de: "German",
      it: "Italian",
      pt: "Portuguese",
      nl: "Dutch",
      ja: "Japanese",
      zh: "Chinese",
    }

    const outputLanguage = languages[language]
    return outputLanguage ?? "Unknown Language"
  }
}

export default IsbnService;
