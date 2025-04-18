import SuccessResponse from "../response/SuccessResponse";
import RequestErrorResponse from "../response/RequestErrorResponse";
import { Book } from "../db/schema/Book";

class IsbnService {
  async retrieveMetadata(
    isbn: string
  ): Promise<SuccessResponse<Book | unknown> | RequestErrorResponse> {
    console.log("FIRING OFF CALL TO ISBN FOR BOOK DATA");
    const result = await fetch(`https://api.isbndb.com/book/${isbn}`, {
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
    console.log(resultJson);

    const book_title: string = book.title ?? book.title_long ?? "Unknown title";
    let isbn_list: string = ""; // this should always exist given that we're querying by isbn here lol
    if (book.isbn13) {
      isbn_list = book.isbn13;
    } else if (book.isbn) {
      isbn_list = book.isbn;
    }
    const author: string = book.authors ? book.authors.join(", ") : "Unknown author";
    const primary_genre_id: number = undefined; // unknown from just ISBN
    const audience_id: number = undefined; // unknown from just ISBN
    const pages: number = book.pages;
    const series_id: number = undefined; // unknown from just ISBN
    const series_number: number = undefined; // unknown from just ISBN
    const publish_date: number =
      (book.date_published?.length > 4
        ? new Date(book.date_published).getFullYear()
        : book.date_published);
    const short_description: string =
      book.synopsis?.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ") ??
      "No synopsis found"; // sanitizeHtml does not replace self-closing tags
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
    };

    const outputLanguage = languages[language];
    return outputLanguage ?? "Unknown Language";
  }
}

export default IsbnService;
