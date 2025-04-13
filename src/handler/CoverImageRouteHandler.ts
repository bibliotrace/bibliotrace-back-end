import RequestErrorResponse from "../response/RequestErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
import { isValidISBN, sanitizeISBN } from "../utils/utils";

export class CoverImageRouteHandler {
  constructor() {}

  async relayImage(params: any): Promise<Buffer | RequestErrorResponse> {
    // This is a success response because it's not an error, just a lack of data
    if (!params.isbn) {
      return new SuccessResponse("No ISBN provided to cover image endpoint");
    }
    const isbn = sanitizeISBN(params.isbn);
    if (!isValidISBN(isbn)) return new RequestErrorResponse("Invalid ISBN provided");

    // Do we ever pass in an ISBN with a .jpg?
    // ISBN's cover images tend to come back nicer than OpenLibrary so that may be worth looking into
    if (isbn.includes(".jpg")) {
      const result = await this.fetchImage(`https://images.isbndb.com/covers/${isbn}`);
      return result;
    }

    const imageSizes = ["L", "M"]; // You can add "S" to this list but those ones tend to be pretty rough... Use at your own risk

    for (let i = 0; i < imageSizes.length; i++) {
      const result = await this.fetchImage(
        `https://covers.openlibrary.org/b/isbn/${isbn}-${imageSizes[i]}.jpg`
      );
      if (result != null) {
        return result;
      }
    }
  }

  async fetchImage(url: string): Promise<Buffer | null> {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength >= 100) {
          return Buffer.from(buffer);
        }
      } else {
        console.log("Response from Internet Archive was not ok...", response);
        return null;
      }
    } catch (error) {
      console.log("Error while fetching image", error);
    }
  }
}
