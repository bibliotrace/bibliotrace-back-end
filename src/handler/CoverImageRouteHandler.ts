export class CoverImageRouteHandler {
  constructor() {}

  async relayImage(isbn: string): Promise<Buffer | null> {
    const imageSizes = ["L", "M", "S"];
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchImage = async (url: string): Promise<Buffer | null> => {
      try {
        const response = await fetch(url, { signal });
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          if (buffer.byteLength >= 100) {
            controller.abort(); // Cancel other fetches
            return Buffer.from(buffer);
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log(`Error fetching ${url}:`, error);
        }
      }
      return null;
    };

    const fetchPromises = imageSizes.map((size) =>
      fetchImage(`https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`)
    );

    // Add Google Books API fetch
    fetchPromises.push(
      (async () => {
        try {
          const lookupURL = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
          const response = await fetch(lookupURL, { signal });
          if (!response.ok) return null;
          const data = await response.json();
          const imageURL = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
          if (imageURL) return fetchImage(imageURL);
        } catch (error) {
          if (error.name !== "AbortError") {
            console.log(`Error fetching Google Books API:`, error);
          }
        }
        return null;
      })()
    );

    const firstSuccessfulResponse = await Promise.any(fetchPromises);
    return firstSuccessfulResponse;
  }
}
