export class CoverImageRouteHandler {
  constructor() {}

  async relayImage(isbn: string): Promise<Buffer | null> {
    const imageSizes = ["L", "M"]; // You can add "S" to this list but those ones tend to be pretty rough... Use at your own risk
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchImage = async (url: string): Promise<Buffer | null> => {
      try {
        console.log('URL FOR FETCH IS ', url)
        const response = await fetch(url, { signal });
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          if (buffer.byteLength >= 100) {
            controller.abort(); // Cancel other fetches
            return Buffer.from(buffer);
          }
        } else {
          await this.sleep(10000)
          console.log('Response from Internet Archive was not ok...', response)
          return null
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.log(`Error fetching ${url}:`, error);
        }
      }
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
          if (!response.ok) {
            await this.sleep(10000);
            console.log('Response from Google Books was not ok...', response)
            return null
          }
          const data = await response.json();
          const imageURL = data.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
          if (imageURL) return fetchImage(imageURL);
        } catch (error) {
          if (error.name !== "AbortError") {
            console.log(`Error fetching Google Books API:`, error);
          }
        }
        await this.sleep(10000)
        console.log('IMAGE NOT FOUND, Returning null')
        return null
      })()
    );

    const firstSuccessfulResponse = await Promise.any(fetchPromises);
    return firstSuccessfulResponse;
  }

  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
