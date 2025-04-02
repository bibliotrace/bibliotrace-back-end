import IsbnService from "../../src/service/IsbnService";

describe("ISBN service testing suite", () => {
  let isbnService: IsbnService;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    isbnService = new IsbnService();
    process.env.ISBN_HOST = "test.host";
    process.env.ISBN_KEY = "testKey";

    global.fetch = jest.fn(async (targetUrl, options) => {
      if (options.headers.Authorization != "testKey") {
        return {
          json: async () => {
            return { error: "Auth Missing" };
          },
          text: async () => {
            return '{ "error": "Auth Missing" }'
          },
          ok: false,
          status: 401,
        };
      }

      if (targetUrl === "test.host/book/123456789") {
        return {
          json: async () => {
            return {
              book: {
                publisher: "Pottermore Publishing",
                synopsis:
                  "'welcome To The Knight Bus, Emergency Transport For The Stranded Witch Or Wizard. Just Stick Out Your Wand Hand, Step On Board And We Can Take You Anywhere You Want To Go.' When The Knight Bus Crashes Through The Darkness And Screeches To A Halt In Front Of Him, It's The Start Of Another Far From Ordinary Year At Hogwarts For Harry Potter. Sirius Black, Escaped Mass-murderer And Follower Of Lord Voldemort, Is On The Run - And They Say He Is Coming After Harry. In His First Ever Divination Class, Professor Trelawney Sees An Omen Of Death In Harry's Tea Leaves... But Perhaps Most Terrifying Of All Are The Dementors Patrolling The School Grounds, With Their Soul-sucking Kiss...",
                language: "en",
                image: "https://images.isbndb.com/covers/3705783482822.jpg",
                title_long: "Harry Potter and the Prisoner of Azkaban",
                pages: 180,
                date_published: "2015",
                subjects: [
                  "Literature & Fiction",
                  "Action & Adventure",
                  "Fantasy",
                  "Science Fiction & Fantasy",
                  "Paranormal & Urban",
                  "Teen & Young Adult",
                  "Social & Family Issues",
                  "Kindle Store",
                  "Categories",
                  "Kindle eBooks",
                ],
                authors: ["J.K. Rowling"],
                title: "Harry Potter and the Prisoner of Azkaban",
                isbn13: "9781781100516",
                msrp: "0.00",
                binding: "Kindle Edition",
                isbn: "1781100519",
                isbn10: "1781100519",
              },
            };
          },
          ok: true,
        };
      } else if (targetUrl === "test.host/book/987654321") {
        return {
          json: async () => {
            return {
              book: {
                publisher: "Pottermore Publishing",
                synopsis:
                  "'welcome To The Knight Bus, Emergency Transport For The Stranded Witch Or Wizard. Just Stick Out Your Wand Hand, Step On Board And We Can Take You Anywhere You Want To Go.' When The Knight Bus Crashes Through The Darkness And Screeches To A Halt In Front Of Him, It's The Start Of Another Far From Ordinary Year At Hogwarts For Harry Potter. Sirius Black, Escaped Mass-murderer And Follower Of Lord Voldemort, Is On The Run - And They Say He Is Coming After Harry. In His First Ever Divination Class, Professor Trelawney Sees An Omen Of Death In Harry's Tea Leaves... But Perhaps Most Terrifying Of All Are The Dementors Patrolling The School Grounds, With Their Soul-sucking Kiss...",
                language: "en",
                image: "https://images.isbndb.com/covers/3705783482822.jpg",
                title_long: "Harry Potter and the Prisoner of Azkaban",
                pages: 180,
                date_published: "2015",
                subjects: [
                  "Literature & Fiction",
                  "Action & Adventure",
                  "Fantasy",
                  "Science Fiction & Fantasy",
                  "Paranormal & Urban",
                  "Teen & Young Adult",
                  "Social & Family Issues",
                  "Kindle Store",
                  "Categories",
                  "Kindle eBooks",
                ],
                authors: ["J.K. Rowling"],
                title: "Harry Potter and the Prisoner of Azkaban",
                msrp: "0.00",
                binding: "Kindle Edition",
                isbn: "1781100519",
                isbn10: "1781100519",
              },
            };
          },
          ok: true,
        };
      } else if (targetUrl === "test.host/book/918273645") {
        return {
          json: async () => {
            return {
              book: {
                publisher: "Pottermore Publishing",
                synopsis:
                  "'welcome To The Knight Bus, Emergency Transport For The Stranded Witch Or Wizard. Just Stick Out Your Wand Hand, Step On Board And We Can Take You Anywhere You Want To Go.' When The Knight Bus Crashes Through The Darkness And Screeches To A Halt In Front Of Him, It's The Start Of Another Far From Ordinary Year At Hogwarts For Harry Potter. Sirius Black, Escaped Mass-murderer And Follower Of Lord Voldemort, Is On The Run - And They Say He Is Coming After Harry. In His First Ever Divination Class, Professor Trelawney Sees An Omen Of Death In Harry's Tea Leaves... But Perhaps Most Terrifying Of All Are The Dementors Patrolling The School Grounds, With Their Soul-sucking Kiss...",
                language: "en",
                image: "https://images.isbndb.com/covers/3705783482822.jpg",
                title_long: "Harry Potter and the Prisoner of Azkaban",
                pages: 180,
                date_published: "2015",
                subjects: [
                  "Literature & Fiction",
                  "Action & Adventure",
                  "Fantasy",
                  "Science Fiction & Fantasy",
                  "Paranormal & Urban",
                  "Teen & Young Adult",
                  "Social & Family Issues",
                  "Kindle Store",
                  "Categories",
                  "Kindle eBooks",
                ],
                authors: ["J.K. Rowling"],
                isbn13: "9781781100516",
                title: "Harry Potter and the Prisoner of Azkaban",
                msrp: "0.00",
                binding: "Kindle Edition",
              },
            };
          },
          ok: true,
        };
      } else if (targetUrl === "test.host/books/Harry Potter?pageSize=1000") {
        return {
          json: async () => {
            return {
              total: 7969,
              books: [
                {
                  title: "Harry Potter and the Sorcerer's Stone",
                  image: "https://images.isbndb.com/covers/3705483482822.jpg",
                  title_long: "Harry Potter and the Sorcerer's Stone",
                  date_published: "2015",
                  publisher: "Pottermore Publishing",
                  synopsis:
                    "Turning The Envelope Over, His Hand Trembling, Harry Saw A Purple Wax Seal Bearing A Coat Of Arms; A Lion, An Eagle, A Badger And A Snake Surrounding A Large Letter 'h'. Harry Potter Has Never Even Heard Of Hogwarts When The Letters Start Dropping On The Doormat At Number Four, Privet Drive. Addressed In Green Ink On Yellowish Parchment With A Purple Seal, They Are Swiftly Confiscated By His Grisly Aunt And Uncle. Then, On Harry's Eleventh Birthday, A Great Beetle-eyed Giant Of A Man Called Rubeus Hagrid Bursts In With Some Astonishing News: Harry Potter Is A Wizard, And He Has A Place At Hogwarts School Of Witchcraft And Wizardry. An Incredible Adventure Is About To Begin! Pottermore Has Now Launched The Wizarding World Book Club. Visit Pottermore To Sign Up And Join Weekly Twitter Discussions At Ww Book Club.",
                  subjects: [
                    "Literature & Fiction",
                    "Action & Adventure",
                    "Fantasy",
                    "Science Fiction & Fantasy",
                    "Paranormal & Urban",
                    "Humorous",
                    "Teen & Young Adult",
                    "Social & Family Issues",
                    "Kindle Store",
                    "Categories",
                    "Kindle eBooks",
                  ],
                  authors: ["J.K. Rowling"],
                  isbn13: "9781781100486",
                  binding: "Kindle Edition",
                  isbn: "1781100489",
                  isbn10: "1781100489",
                  language: "en",
                  pages: 345,
                },
                {
                  title:
                    "Harry Potter and the Goblet of Fire (Harry Potter, Book 4) (Interactive Illustrated Edition)",
                  image: "https://images.isbndb.com/covers/13451173482738.jpg",
                  title_long:
                    "Harry Potter and the Goblet of Fire (Harry Potter, Book 4) (Interactive Illustrated Edition)",
                  date_published: "2025-10-14",
                  publisher: "Scholastic Inc.",
                  synopsis:
                    "A stunning special edition of the fourth book in the Harry Potter series, illustrated in brilliant full color and featuring eight unique interactive elements, including the Maze at the Triwizard Tournament, the Goblet of Fire itself, and more!<br/><br/>Get ready for adventure in this deluxe special edition of Harry Potter and the Goblet of Fire! J.K. Rowling’s complete and unabridged text is accompanied by full-color illustrations throughout and eight paper-engineered interactive elements: Readers will explore the Weasleys’ tent at the Quidditch World Cup, reveal the Dark Mark in the sky, follow Harry into the Lake at Hogwarts, and more.<br/><br/>This keepsake edition is an impressive gift for Harry Potter fans of all ages, a beautiful addition to any collector’s bookshelf, and an enchanting way to share this beloved series with a new generation of readers.",
                  subjects: [
                    "Children's Books",
                    "Growing Up & Facts of Life",
                    "Friendship, Social Skills & School Life",
                  ],
                  authors: ["J. K. Rowling"],
                  isbn13: "9781546154419",
                  binding: "Hardcover",
                  isbn: "1546154418",
                  isbn10: "1546154418",
                  language: "en",
                  pages: 608,
                },
                {
                  title: "Harry Potter and the Chamber of Secrets",
                  image: "https://images.isbndb.com/covers/3705713482822.jpg",
                  title_long: "Harry Potter and the Chamber of Secrets",
                  date_published: "2015",
                  publisher: "Pottermore Publishing",
                  synopsis:
                    "'there Is A Plot, Harry Potter. A Plot To Make Most Terrible Things Happen At Hogwarts School Of Witchcraft And Wizardry This Year.' Harry Potter's Summer Has Included The Worst Birthday Ever, Doomy Warnings From A House-elf Called Dobby, And Rescue From The Dursleys By His Friend Ron Weasley In A Magical Flying Car! Back At Hogwarts School Of Witchcraft And Wizardry For His Second Year, Harry Hears Strange Whispers Echo Through Empty Corridors - And Then The Attacks Start. Students Are Found As Though Turned To Stone... Dobby's Sinister Predictions Seem To Be Coming True.",
                  subjects: [
                    "Literature & Fiction",
                    "Action & Adventure",
                    "Fantasy",
                    "Science Fiction & Fantasy",
                    "Paranormal & Urban",
                    "Humorous",
                    "Teen & Young Adult",
                    "Social & Family Issues",
                    "Kindle Store",
                    "Categories",
                    "Kindle eBooks",
                  ],
                  authors: ["J.K. Rowling"],
                  isbn13: "9781781100509",
                  edition: "Illustrated",
                  binding: "Kindle Edition",
                  isbn: "1781100500",
                  isbn10: "1781100500",
                  language: "en",
                  pages: 141,
                },
              ],
            };
          },
          ok: true,
        };
      } else {
        return {
          text: async () => {
            return JSON.stringify({
              errorType: "string",
              errorMessage: "Not Found",
              trace: [],
            });
          },
          status: 404,
          ok: false,
        };
      }
    }) as jest.Mock;
  });

  test("retrieve metadata for valid book", async () => {
    const response = await isbnService.retrieveMetadata("123456789");

    expect(response.statusCode).toBe(200);
    expect(response.object).toStrictEqual({
      audience_id: undefined,
      author: "J.K. Rowling",
      book_title: "Harry Potter and the Prisoner of Azkaban",
      img_callback: "https://images.isbndb.com/covers/3705783482822.jpg",
      isbn_list: "9781781100516",
      language: "English",
      pages: 180,
      primary_genre_id: undefined,
      publish_date: "2015",
      series_id: undefined,
      series_number: undefined,
      short_description:
        "'welcome To The Knight Bus, Emergency Transport For The Stranded Witch Or Wizard. Just Stick Out Your Wand Hand, Step On Board And We Can Take You Anywhere You Want To Go.' When The Knight Bus Crashes Through The Darkness And Screeches To A Halt In Front Of Him, It's The Start Of Another Far From Ordinary Year At Hogwarts For Harry Potter. Sirius Black, Escaped Mass-murderer And Follower Of Lord Voldemort, Is On The Run - And They Say He Is Coming After Harry. In His First Ever Divination Class, Professor Trelawney Sees An Omen Of Death In Harry's Tea Leaves... But Perhaps Most Terrifying Of All Are The Dementors Patrolling The School Grounds, With Their Soul-sucking Kiss...",
    });
  });

  test("retrieve metadata for valid book, testing limited isbn availability", async () => {
    // Missing isbn13
    const response = await isbnService.retrieveMetadata("987654321") as any;

    expect(response.statusCode).toBe(200);
    expect(response.object.isbn_list).toEqual('1781100519');

    // Missing isbn10/isbn
    const response2 = await isbnService.retrieveMetadata("918273645") as any;

    expect(response2.statusCode).toBe(200);
    expect(response2.object.isbn_list).toEqual('9781781100516');
  });

  test("retrieve metadata for invalid book", async () => {
    const response = await isbnService.retrieveMetadata("unknown");

    expect(response.statusCode).toBe(404);
    expect(response.object).toBe(undefined);
    expect(response.message).toBe(
      'Call to ISBNdb Not Ok, status: 404, body: {"errorType":"string","errorMessage":"Not Found","trace":[]}'
    );
  });

  test("conduct search with a valid query, isbn returns multiple options", async () => {
    const response = (await isbnService.conductSearch("Harry Potter")) as any;

    expect(response.statusCode).toBe(200);
    expect(response.object).not.toBeNull();
    expect(response.object.length).toBe(6);
  });

  test("conduct search with a valid query, isbn returns nothing", async () => {
    const response = await isbnService.conductSearch("Nothing");

    expect(response.statusCode).toBe(200);
    expect(response.message).toBe("No Books Found");
  });

  test("conduct search with invalid auth problem", async () => {
    process.env.ISBN_KEY = "wrongKey";
    const response = await isbnService.conductSearch("Nothing");

    expect(response.statusCode).toBe(401);
    expect(response.message).toBe('Call to ISBNdb Not Ok, status: 401, body: { "error": "Auth Missing" }')
  });
});
