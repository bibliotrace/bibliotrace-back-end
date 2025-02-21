import { sanitizeUrl } from "@braintree/sanitize-url";
import SuccessResponse from "../db/response/SuccessResponse";
import RequestErrorResponse from "../db/response/RequestErrorResponse";

class IsbnService {
  async conductSearch(inputQuery: string) {
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
        return new SuccessResponse('No Books Found')
      } else {
        return new RequestErrorResponse(`Call to ISBNdb Not Ok, status: ${result.status}, body: ${await result.text()}`, result.status)
      }
    }
    const resultJson = await result.json();

    console.log('CALLED THE ISBNDB!!!!! Parsing the result...')

    const isbnList = [];
    resultJson.books.map((result) => {
      if (result.isbn10 != null) isbnList.push(`${result.isbn10}||${result.image}`);
      if (result.isbn13 != null) isbnList.push(`${result.isbn13}||${result.image}`);
    });

    return new SuccessResponse('Successfully Pulled in ISBNs', isbnList);
  }
}

export default IsbnService;
