import SearchDataService from "../../src/service/SearchDataService";
import DaoFactory from "../../src/db/dao/DaoFactory";
import SuccessResponse from "../../src/response/SuccessResponse";
import ServerErrorResponse from "../../src/response/ServerErrorResponse";
import BookDao from "../../src/db/dao/BookDao";

jest.mock("../../src/db/dao/DaoFactory");

describe("Search data service testing suite", () => {
  let searchDataService: SearchDataService;
  let daoFactoryMock: DaoFactory;
  let bookDaoMock: BookDao;

  beforeEach(() => {
    bookDaoMock = {
      getBasicBookByFilter: jest.fn(async (filter, isbn, campus) => {
        if (isbn === "12345") {
          return new SuccessResponse("We did it!", {
            id: 1,
            book_title: "Anne of Green Gables",
            author: "Lucy Maud Montgomery",
            genre_name: "Fantasy",
            series_name: "None",
          });
        } else if (isbn === "freak out") {
          return new ServerErrorResponse("oopsie doopsie", 500);
        }

        return new SuccessResponse("We kinda did it", undefined);
      }),
      getAllISBNs: jest.fn(async (filter, campus) => {
        if (campus === "Lehi") {
          return new SuccessResponse("We did it!", [
            { isbn_list: "987654321" },
            { isbn_list: "123456789|0987654321" },
          ]);
        } else if (filter[0] != null && filter[0].value === "chaos") {
          return new ServerErrorResponse("ouch", 500);
        } else {
          return new SuccessResponse("We kinda did it", []);
        }
      }),
    } as unknown as jest.Mocked<BookDao>;

    daoFactoryMock = {
      bookDao: bookDaoMock, // Inject the mocked DAO
    } as DaoFactory;

    searchDataService = new SearchDataService(daoFactoryMock);
  });

  test("Retreive basic metadata call for a valid book that matches filters", async () => {
    const result = await searchDataService.retrieveBasicMetadata(
      [
        {
          key: "",
          value: "",
        },
      ],
      "12345||helloWorld",
      "Lehi"
    );

    expect(daoFactoryMock.bookDao.getBasicBookByFilter).toHaveBeenCalledWith(
      [
        {
          key: "",
          value: "",
        },
      ],
      "12345",
      "Lehi"
    );
    expect(result.statusCode).toBe(200);
    expect(result.object).toEqual({
      author: "Lucy Maud Montgomery",
      coverImageId: "helloWorld",
      genre: "Fantasy",
      id: "1",
      isbn: "12345",
      series: "None",
      title: "Anne of Green Gables",
    });
  });

  test("Retreive basic metadata call for a valid book, no filter match", async () => {
    const result = await searchDataService.retrieveBasicMetadata(
      [{ key: "genre_types.genre_name", value: "Fantasy" }],
      "54321987||helloWorld",
      "Lehi"
    );

    expect(daoFactoryMock.bookDao.getBasicBookByFilter).toHaveBeenCalledWith(
      [{ key: "genre_types.genre_name", value: "Fantasy" }],
      "54321987",
      "Lehi"
    );
    expect(result.statusCode).toBe(200);
    expect(result.message).toEqual("No Book Found");
    expect(result.object).not.toBeDefined();
  });

  test("Retrieve basic metadata call, db freaks out", async () => {
    const result = await searchDataService.retrieveBasicMetadata(
      [{ key: "genre_types.genre_name", value: "Fantasy" }],
      "freak out",
      "Lehi"
    );

    expect(daoFactoryMock.bookDao.getBasicBookByFilter).toHaveBeenCalledWith(
      [{ key: "genre_types.genre_name", value: "Fantasy" }],
      "freak out",
      "Lehi"
    );
    expect(result.statusCode).toBe(500);
    expect(result.object).not.toBeDefined();
    expect(result.message).toStrictEqual("oopsie doopsie");
  });

  test("Retrieve all ISBNs with a valid querylist and campus", async () => {
    const result = await searchDataService.retrieveAllISBNs([{}], "Lehi");

    expect(daoFactoryMock.bookDao.getAllISBNs).toHaveBeenCalledWith([{}], "Lehi");
    expect(result.statusCode).toEqual(200);
    expect(result.object).toEqual(["987654321", "123456789"]);
  });

  test("Retrieve all ISBNs with valid everything, but nothing comes back", async () => {
    const result = await searchDataService.retrieveAllISBNs(
      [{ key: "genre", value: "impossible" }],
      "Salt Lake City"
    );

    expect(daoFactoryMock.bookDao.getAllISBNs).toHaveBeenCalledWith(
      [{ key: "genre", value: "impossible" }],
      "Salt Lake City"
    );
    expect(result.statusCode).toEqual(404);
    expect(result.object).toBeUndefined();
  });

  test("Retrieve all ISBNs with valid everything, but the db fails", async () => {
    const result = await searchDataService.retrieveAllISBNs(
      [{ key: "hello", value: "chaos" }],
      "Salt Lake City"
    );

    expect(daoFactoryMock.bookDao.getAllISBNs).toHaveBeenCalledWith(
      [{ key: "hello", value: "chaos" }],
      "Salt Lake City"
    );
    expect(result.statusCode).toEqual(500);
    expect(result.object).toBeUndefined();
  });
});
