import { Transaction } from "kysely";
import AudienceDao from "../../../src/db/dao/AudienceDao";
import AuditDao from "../../../src/db/dao/AuditDao";
import AuditEntryDao from "../../../src/db/dao/AuditEntryDao";
import BookDao from "../../../src/db/dao/BookDao";
import BookGenreDao from "../../../src/db/dao/BookGenreDao";
import BookTagDao from "../../../src/db/dao/BookTagDao";
import CampusDao from "../../../src/db/dao/CampusDao";
import CheckoutDao from "../../../src/db/dao/CheckoutDao";
import Dao from "../../../src/db/dao/Dao";
import DaoFactory from "../../../src/db/dao/DaoFactory";
import GenreDao from "../../../src/db/dao/GenreDao";
import InventoryDao from "../../../src/db/dao/InventoryDao";
import LocationDao from "../../../src/db/dao/LocationDao";
import RestockListDao from "../../../src/db/dao/RestockListDao";
import SeriesDao from "../../../src/db/dao/SeriesDao";
import ShoppingListDao from "../../../src/db/dao/ShoppingListDao";
import SuggestionDao from "../../../src/db/dao/SuggestionDao";
import TagDao from "../../../src/db/dao/TagDao";
import UserDao from "../../../src/db/dao/UserDao";
import UserRoleDao from "../../../src/db/dao/UserRoleDao";
import { Audience } from "../../../src/db/schema/Audience";
import { Audit } from "../../../src/db/schema/Audit";
import { AuditEntry } from "../../../src/db/schema/AuditEntry";
import { Book } from "../../../src/db/schema/Book";
import { BookGenre } from "../../../src/db/schema/BookGenre";
import { BookTag } from "../../../src/db/schema/BookTag";
import { Campus } from "../../../src/db/schema/Campus";
import { Checkout } from "../../../src/db/schema/Checkout";
import Database from "../../../src/db/schema/Database";
import { Genre } from "../../../src/db/schema/Genre";
import { Inventory } from "../../../src/db/schema/Inventory";
import { Location } from "../../../src/db/schema/Location";
import { RestockList } from "../../../src/db/schema/RestockList";
import { Series } from "../../../src/db/schema/Series";
import { ShoppingList } from "../../../src/db/schema/ShoppingList";
import { Suggestion } from "../../../src/db/schema/Suggestion";
import { Tag } from "../../../src/db/schema/Tag";
import { User } from "../../../src/db/schema/User";
import { UserRole } from "../../../src/db/schema/UserRole";
import RequestErrorResponse from "../../../src/response/RequestErrorResponse";
import Response from "../../../src/response/Response";
import ServerErrorResponse from "../../../src/response/ServerErrorResponse";
import SuccessResponse from "../../../src/response/SuccessResponse";
import TestConnectionManager from "../../TestConnectionManager";

// NOTE: This testing suite assumes that data already comes in with the right fields, which should largely be parsed/checked in the handlers

describe("DAO testing suite", () => {
  let daoFactory: DaoFactory;
  let audienceDao: AudienceDao;
  let auditDao: AuditDao;
  let auditEntryDao: AuditEntryDao;
  let bookDao: BookDao;
  let bookGenreDao: BookGenreDao;
  let bookTagDao: BookTagDao;
  let campusDao: CampusDao;
  let checkoutDao: CheckoutDao;
  let genreDao: GenreDao;
  let inventoryDao: InventoryDao;
  let locationDao: LocationDao;
  let restockListDao: RestockListDao;
  let seriesDao: SeriesDao;
  let shoppingListDao: ShoppingListDao;
  let suggestionDao: SuggestionDao;
  let tagDao: TagDao;
  let userDao: UserDao;
  let userRoleDao: UserRoleDao;

  let entityDaoMap: Map<string, { entity: any; dao: Dao<any, any> }>;
  let entityDaoMap2: Map<string, { entity: any; dao: Dao<any, any> }>;
  let entityDaoMapNullable: Map<string, { entity: any; dao: Dao<any, any> }>;

  let dummyAudience: Audience;
  let dummyAudience2: Audience;
  let dummyAudienceNullable: Audience;

  let dummyAudit: Audit;
  let dummyAudit2: Audit;
  let dummyAuditNullable: Audit;

  let dummyAuditEntry: AuditEntry;
  let dummyAuditEntry2: AuditEntry;
  let dummyAuditEntryNullable: AuditEntry;

  let dummyBook: Book;
  let dummyBook2: Book;
  let dummyBookNullable: Book;

  let dummyCampus: Campus;
  let dummyCampus2: Campus;
  let dummyCampusNullable: Campus;

  let dummyCheckout: Checkout;
  let dummyCheckout2: Checkout;
  let dummyCheckoutNullable: Checkout;

  let dummyBookGenre: BookGenre;
  let dummyBookGenre2: BookGenre;
  let dummyBookGenreNullable: BookGenre;

  let dummyGenre: Genre;
  let dummyGenre2: Genre;
  let dummyGenreNullable: Genre;

  let dummyInventory: Inventory;
  let dummyInventory2: Inventory;
  let dummyInventoryNullable: Inventory;

  let dummyLocation: Location;
  let dummyLocation2: Location;
  let dummyLocationNullable: Location;

  let dummyRestockList: RestockList;
  let dummyRestockList2: RestockList;
  let dummyRestockListNullable: RestockList;

  let dummySeries: Series;
  let dummySeries2: Series;
  let dummySeriesNullable: Series;

  let dummyShoppingList: ShoppingList;
  let dummyShoppingList2: ShoppingList;
  let dummyShoppingListNullable: ShoppingList;

  let dummySuggestion: Suggestion;
  let dummySuggestion2: Suggestion;
  let dummySuggestionNullable: Suggestion;

  let dummyBookTag: BookTag;
  let dummyBookTag2: BookTag;
  let dummyBookTagNullable: BookTag;

  let dummyTag: Tag;
  let dummyTag2: Tag;
  let dummyTagNullable: Tag;

  let dummyUser: User;
  let dummyUser2: User;
  let dummyUserNullable: User;

  let dummyUserRole: UserRole;
  let dummyUserRole2: UserRole;
  let dummyUserRoleNullable: UserRole;

  let mockTransaction: Transaction<Database>;

  beforeAll(async () => {
    await TestConnectionManager.initialize();
    await TestConnectionManager.runCreateTestSQL();
    console.log("Test database initialized");

    daoFactory = new DaoFactory(TestConnectionManager.kyselyDB);
    audienceDao = daoFactory.getAudienceDao();
    auditDao = daoFactory.getAuditDao();
    auditEntryDao = daoFactory.getAuditEntryDao();
    bookDao = daoFactory.getBookDao();
    bookGenreDao = daoFactory.getBookGenreDao();
    bookTagDao = daoFactory.getBookTagDao();
    campusDao = daoFactory.getCampusDao();
    checkoutDao = daoFactory.getCheckoutDao();
    genreDao = daoFactory.getGenreDao();
    inventoryDao = daoFactory.getInventoryDao();
    locationDao = daoFactory.getLocationDao();
    restockListDao = daoFactory.getRestockListDao();
    seriesDao = daoFactory.getSeriesDao();
    shoppingListDao = daoFactory.getShoppingListDao();
    suggestionDao = daoFactory.getSuggestionDao();
    tagDao = daoFactory.getTagDao();
    userDao = daoFactory.getUserDao();
    userRoleDao = daoFactory.getUserRoleDao();

    dummyAudience = {
      id: 10,
      audience_name: "Potterheads",
    };

    dummyAudience2 = {
      id: 12,
      audience_name: "Muggles",
    };

    dummyAudienceNullable = {
      audience_name: "Squibs",
    };

    dummyAudit = {
      id: 10,
      campus_id: 10,
    };

    dummyAudit2 = {
      id: 12,
      campus_id: 12,
    };

    dummyAuditNullable = {
      campus_id: 11,
    };

    dummyAuditEntry = {
      qr: "aa1111",
      audit_id: 10,
      state: null,
    };

    dummyAuditEntry2 = {
      qr: "bb2222",
      audit_id: 12,
      state: null,
    };

    dummyAuditEntryNullable = {
      qr: "cc3333",
      audit_id: 11,
      state: null,
    };

    dummyBook = {
      id: 10,
      book_title: "Harry Potter and the Philosopher's Stone",
      isbn_list: "9780747532743|9780747532743",
      author: "J.K. Rowling",
      primary_genre_id: 10,
      audience_id: 10,
      pages: 1000,
      series_id: 10,
      series_number: 10,
      publish_date: 1995, // YYYY
      short_description:
        "Harry Potter and the Sorcerer's Stone introduces Harry, a young boy who discovers he is a wizard on his 11th birthday. He attends Hogwarts School of Witchcraft and Wizardry, where he makes new friends and uncovers the mystery behind a magical artifact, the Sorcerer's Stone, which has the power to grant immortality. As Harry learns about his parents' past and the dark wizard who killed them, he faces challenges that will test his bravery and friendship.",
      language: "English",
      img_callback: "https://www.example.com/harry_potter_1.jpg",
    };

    dummyBook2 = {
      id: 12,
      book_title: "Harry Potter and the Chamber of Secrets",
      isbn_list: "9780747538486|9780747538486",
      author: "J.K. Rowling",
      primary_genre_id: 12,
      audience_id: 12,
      pages: 341,
      series_id: 12,
      series_number: 2,
      publish_date: 1998, // YYYY
      short_description:
        "Harry Potter and the Chamber of Secrets continues the adventures of Harry as he returns to Hogwarts for his second year. He and his friends investigate a series of mysterious attacks on students and uncover the dark history of the Chamber of Secrets.",
      language: "English",
      img_callback: "https://www.example.com/harry_potter_2.jpg",
    };

    dummyBookNullable = {
      book_title: "Harry Potter and the Prisoner of Azkaban",
      author: "J.K. Rowling",
      primary_genre_id: 11,
      audience_id: 11,
    };

    dummyCampus = {
      id: 10,
      campus_name: "Hogwarts",
    };

    dummyCampus2 = {
      id: 12,
      campus_name: "Beauxbatons",
    };

    dummyCampusNullable = {
      campus_name: "Durmstrang",
    };

    dummyCheckout = {
      checkout_id: 10,
      qr: "aa1111",
      book_id: 10,
      state: "First",
    };

    dummyCheckout2 = {
      checkout_id: 12,
      qr: "bb2222",
      book_id: 12,
      state: "In",
    };

    dummyCheckoutNullable = {
      qr: "cc3333",
      book_id: 11, // this should be the first ID generated by a book without a known ID
      state: "Out",
    };

    dummyBookGenre = {
      id: 1,
      book_id: 10,
      genre_id: 10,
    };

    dummyBookGenre2 = {
      id: 2,
      book_id: 12,
      genre_id: 12,
    };

    dummyBookGenreNullable = {
      book_id: 11,
      genre_id: 13,
    };

    dummyGenre = {
      id: 10,
      genre_name: "Fantasy",
    };

    dummyGenre2 = {
      id: 12,
      genre_name: "Adventure",
    };

    dummyGenreNullable = {
      genre_name: "Sci-Fi",
    };

    dummyInventory = {
      qr: "aa1111",
      book_id: 10,
      location_id: 10,
      campus_id: 10,
      ttl: 10,
    };

    dummyInventory2 = {
      qr: "bb2222",
      book_id: 12,
      location_id: 12,
      campus_id: 12,
      ttl: 20,
    };

    dummyInventoryNullable = {
      qr: "cc3333",
      book_id: 11, // this should be the first ID generated by a book without a known ID
      location_id: 11, // this should be the first ID generated by a location without a known ID
      campus_id: 11, // this should be the first ID generated by a campus without a known ID
    };

    dummyLocation = {
      id: 10,
      campus_id: 10,
      location_name: "Room of Requirement",
    };

    dummyLocation2 = {
      id: 12,
      campus_id: 12,
      location_name: "Great Hall",
    };

    dummyLocationNullable = {
      campus_id: 11, // this should be the first ID generated by a campus without a known ID
      location_name: "Forbidden Forest",
    };

    dummyRestockList = {
      book_id: 10,
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      campus_id: 10,
      quantity: 10,
    };

    dummyRestockList2 = {
      book_id: 12,
      title: "Harry Potter and the Chamber of Secrets",
      author: "J.K. Rowling",
      campus_id: 12,
      quantity: 5,
    };

    // none of the fields are nullable in the restock list schema, but we include it for completeness
    dummyRestockListNullable = {
      book_id: 11, // this should be the first ID generated by a book without a known ID
      title: "Harry Potter and the Prisoner of Azkaban",
      author: "J.K. Rowling",
      campus_id: 11, // this should be the first ID generated by a campus without a known ID
      quantity: 1,
    };

    dummySeries = {
      id: 10,
      series_name: "Harry Potter",
      max_count: 10,
    };

    dummySeries2 = {
      id: 12,
      series_name: "Fantastic Beasts",
      max_count: 5,
    };

    dummySeriesNullable = {
      series_name: "Quidditch Through the Ages",
    };

    dummyShoppingList = {
      book_id: 10,
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      campus_id: 10,
    };

    dummyShoppingList2 = {
      book_id: 12,
      title: "Harry Potter and the Chamber of Secrets",
      author: "J.K. Rowling",
      campus_id: 12,
    };

    // none of the fields are nullable in the shopping list schema, but we include it for completeness
    dummyShoppingListNullable = {
      book_id: 11, // this should be the first ID generated by a book without a known ID
      title: "Harry Potter and the Prisoner of Azkaban",
      author: "J.K. Rowling",
      campus_id: 11, // this should be the first ID generated by a campus without a known ID
    };

    dummySuggestion = {
      suggestion_id: 10,
      content: "Add Harry Potter and the Philosopher's Stone to the library pls",
      campus_id: 10,
    };

    dummySuggestion2 = {
      suggestion_id: 12,
      content: "Add Harry Potter and the Chamber of Secrets to the library pls",
      campus_id: 12,
    };

    dummySuggestionNullable = {
      content: "Add Harry Potter and the Prisoner of Azkaban to the library pls",
      campus_id: 11, // this should be the first ID generated by a campus without a known ID
    };

    dummyBookTag = {
      id: 10,
      book_id: 10,
      tag_id: 10,
    };

    dummyBookTag2 = {
      id: 12,
      book_id: 12,
      tag_id: 12,
    };

    dummyBookTagNullable = {
      book_id: 11, // this should be the first ID generated by a book without a known ID
      tag_id: 12,
    };

    dummyTag = {
      id: 10,
      tag_name: "Hairy Porter",
    };

    dummyTag2 = {
      id: 12,
      tag_name: "Secrets of the Chamber",
    };

    dummyTagNullable = {
      tag_name: "Askaban's Prisoner",
    };

    dummyUser = {
      username: "harry",
      password_hash: "potter", // this is a very secure hash
      role_id: 10,
      email: "harry@potter.com",
      campus_id: 10,
    };

    dummyUser2 = {
      username: "hermione",
      password_hash: "granger", // this is even more secure
      role_id: 12,
      email: "hermione@granger.com",
      campus_id: 12,
    };

    // none of the fields are nullable in the user schema, but we include it for completeness
    dummyUserNullable = {
      username: "ron",
      password_hash: "weasley", // this is the most secure hash
      role_id: 11, // this should be the first ID generated by a user role without a known ID
      email: "ron@weasley.com",
      campus_id: 11, // this should be the first ID generated by a campus without a known ID
    };

    dummyUserRole = {
      id: 10,
      role_name: "Student",
    };

    dummyUserRole2 = {
      id: 12,
      role_name: "Teacher",
    };

    dummyUserRoleNullable = {
      role_name: "Librarian",
    };

    // order matters in this map due to foreign key constraints in some tables relying on existence of other tables
    entityDaoMap = new Map([
      ["Audience", { entity: dummyAudience, dao: audienceDao }],
      ["Genre", { entity: dummyGenre, dao: genreDao }],
      ["Series", { entity: dummySeries, dao: seriesDao }],
      ["User_role", { entity: dummyUserRole, dao: userRoleDao }],
      ["Campus", { entity: dummyCampus, dao: campusDao }],
      ["Location", { entity: dummyLocation, dao: locationDao }],
      ["Book", { entity: dummyBook, dao: bookDao }],
      ["Audit", { entity: dummyAudit, dao: auditDao }],
      ["Inventory", { entity: dummyInventory, dao: inventoryDao }],
      ["Audit_entry", { entity: dummyAuditEntry, dao: auditEntryDao }],
      ["Checkout", { entity: dummyCheckout, dao: checkoutDao }],
      ["Tag", { entity: dummyTag, dao: tagDao }],
      ["Suggestion", { entity: dummySuggestion, dao: suggestionDao }],
      ["User", { entity: dummyUser, dao: userDao }],
      ["Shopping_list", { entity: dummyShoppingList, dao: shoppingListDao }],
      ["Restock_list", { entity: dummyRestockList, dao: restockListDao }],
    ]);

    // order similarly matters here
    entityDaoMap2 = new Map([
      ["Audience", { entity: dummyAudience2, dao: audienceDao }],
      ["Genre", { entity: dummyGenre2, dao: genreDao }],
      ["Series", { entity: dummySeries2, dao: seriesDao }],
      ["User_role", { entity: dummyUserRole2, dao: userRoleDao }],
      ["Campus", { entity: dummyCampus2, dao: campusDao }],
      ["Location", { entity: dummyLocation2, dao: locationDao }],
      ["Book", { entity: dummyBook2, dao: bookDao }],
      ["Audit", { entity: dummyAudit2, dao: auditDao }],
      ["Inventory", { entity: dummyInventory2, dao: inventoryDao }],
      ["Audit_entry", { entity: dummyAuditEntry2, dao: auditEntryDao }],
      ["Checkout", { entity: dummyCheckout2, dao: checkoutDao }],
      ["Tag", { entity: dummyTag2, dao: tagDao }],
      ["Suggestion", { entity: dummySuggestion2, dao: suggestionDao }],
      ["User", { entity: dummyUser2, dao: userDao }],
      ["Shopping_list", { entity: dummyShoppingList2, dao: shoppingListDao }],
      ["Restock_list", { entity: dummyRestockList2, dao: restockListDao }],
    ]);

    entityDaoMapNullable = new Map([
      ["Audience", { entity: dummyAudienceNullable, dao: audienceDao }],
      ["Genre", { entity: dummyGenreNullable, dao: genreDao }],
      ["Series", { entity: dummySeriesNullable, dao: seriesDao }],
      ["User_role", { entity: dummyUserRoleNullable, dao: userRoleDao }],
      ["Campus", { entity: dummyCampusNullable, dao: campusDao }],
      ["Location", { entity: dummyLocationNullable, dao: locationDao }],
      ["Book", { entity: dummyBookNullable, dao: bookDao }],
      ["Audit", { entity: dummyAuditNullable, dao: auditDao }],
      ["Inventory", { entity: dummyInventoryNullable, dao: inventoryDao }],
      ["Audit_entry", { entity: dummyAuditEntryNullable, dao: auditEntryDao }],
      ["Checkout", { entity: dummyCheckoutNullable, dao: checkoutDao }],
      ["Tag", { entity: dummyTagNullable, dao: tagDao }],
      ["Suggestion", { entity: dummySuggestionNullable, dao: suggestionDao }],
      ["User", { entity: dummyUserNullable, dao: userDao }],
      ["Shopping_list", { entity: dummyShoppingListNullable, dao: shoppingListDao }],
      ["Restock_list", { entity: dummyRestockListNullable, dao: restockListDao }],
    ]);

    mockTransaction = jest.fn() as unknown as Transaction<Database>;
  });

  afterAll(async () => {
    await TestConnectionManager.teardownDb();
    await TestConnectionManager.closeConnection();
  });

  beforeEach(async () => {
    // reset test database
    // console.log("Clearing Database For Next Test");
    await TestConnectionManager.resetTables();
    await TestConnectionManager.runCreateTestSQL();
    // console.log("Completed Drop");
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      await dao.create(entity); // this is tested separately
    }
    // console.log("Successful Drop and Rebuild");
  });

  async function populateSecondDummyWave() {
    for (const [entityName, { entity, dao }] of entityDaoMap2) {
      await dao.create(entity);
    }
  }

  async function populateNullableDummyWave() {
    for (const [entityName, { entity, dao }] of entityDaoMapNullable) {
      await dao.create(entity);
    }
  }

  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // these functions match on the minimum amount of required fields that can be returned in each instance of an object in the database
  function isAudience(object: any): object is Audience {
    return "id" in object && "audience_name" in object;
  }

  function isAudit(object: any): object is Audit {
    return "id" in object && "campus_id" in object;
  }

  function isAuditState(object: any): object is AuditEntry {
    return "id" in object && "qr" in object && "audit_id" in object;
  }

  function isBook(object: any): object is Book {
    return (
      "id" in object &&
      "book_title" in object &&
      "author" in object &&
      "primary_genre_id" in object &&
      "audience_id" in object
    );
  }

  function isCampus(object: any): object is Campus {
    return "id" in object && "campus_name" in object;
  }

  function isCheckout(object: any): object is Checkout {
    return (
      "checkout_id" in object &&
      "timestamp" in object &&
      "qr" in object &&
      "book_id" in object &&
      "state" in object
    );
  }

  function isGenres(object: any): object is Genre {
    return "book_id" in object && "genre_id_1" in object;
  }

  function isGenreType(object: any): object is Genre {
    return "id" in object && "genre_name" in object;
  }

  function isInventory(object: any): object is Inventory {
    return "qr" in object && "book_id" in object && "location_id" in object && "campus_id" in object;
  }

  function isLocation(object: any): object is Location {
    return "id" in object && "campus_id" in object && "location_name" in object;
  }

  function isRestockList(object: any): object is RestockList {
    return (
      "book_id" in object &&
      "title" in object &&
      "author" in object &&
      "campus_id" in object &&
      "quantity" in object
    );
  }

  function isSeries(object: any): object is Series {
    return "id" in object && "series_name" in object;
  }

  function isShoppingList(object: any): object is ShoppingList {
    return "book_id" in object && "title" in object && "author" in object && "campus_id" in object;
  }

  function isSuggestion(object: any): object is Suggestion {
    return "suggestion_id" in object && "timestamp" in object && "content" in object && "campus_id" in object;
  }

  function isTag(object: any): object is Tag {
    return "id" in object && "book_id" in object && "tag" in object;
  }

  function isUser(object: any): object is User {
    return (
      "username" in object &&
      "password_hash" in object &&
      "role_id" in object &&
      "email" in object &&
      "campus_id" in object
    );
  }

  function isUserRole(object: any): object is UserRole {
    return "id" in object && "role_name" in object;
  }

  function parseArrayForEquality(response: Response<any>, entityArray: any) {
    if (!response.object || !Array.isArray(response.object)) {
      throw new Error("Response object is not an array");
    }
    response.object = response.object.sort((a, b) => {
      return a.id - b.id;
    });
    for (let i = 0; i < response.object.length; i++) {
      parseObjectForEquality(response.object[i], entityArray[i]);
    }
  }

  function parseObjectForEquality(object: any, entity: any) {
    // audit, checkout, and suggestion all generate timestamps/dates in MySQL, hence they need to be removed from the object before comparison
    if (isAudit(object)) {
      const { last_audit_date: expectedLastAuditDate, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isCheckout(object)) {
      const { timestamp: expectedTimestamp, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isSuggestion(object)) {
      const { timestamp: expectedTimestamp, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else {
      expect(object).toEqual(entity);
    }
  }

  function removeAutoGeneratedFieldsForEquality(object: any, entity: any) {
    if (isAudience(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isAudit(object)) {
      const { last_audit_date, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isAuditState(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isBook(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isCampus(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isCheckout(object)) {
      const { timestamp, checkout_id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isGenres(object)) {
      expect(entity).toEqual(object);
    } else if (isGenreType(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isInventory(object)) {
      expect(entity).toEqual(object);
    } else if (isLocation(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isRestockList(object)) {
      expect(entity).toEqual(object);
    } else if (isSeries(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isShoppingList(object)) {
      expect(entity).toEqual(object);
    } else if (isSuggestion(object)) {
      const { suggestion_id, timestamp, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isTag(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    } else if (isUser(object)) {
      expect(entity).toEqual(object);
    } else if (isUserRole(object)) {
      const { id, ...expectedEntity } = entity;
      expect(entity).toEqual(expectedEntity);
    }
  }

  function expectTransactionFailure(response: Response<any>) {
    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(ServerErrorResponse);
    expect(response.statusCode).toBe(500);
    expect(response.object).toBeUndefined();
    expect(response.message).toContain("Transactions are not supported yet");
  }

  describe("Create tests", () => {
    test("Successful creation of new entities", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap2) {
        const response = await dao.create(entity);
        // console.log(response);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeDefined();
        parseObjectForEquality(response.object, entity);
        expect(response.message).toContain(`${capitalizeFirstLetter(dao.entityName)} created successfully`);
        // console.log("Running tests on Creation");
      }
    });

    test("Successful creation of entities with undefined fields", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMapNullable) {
        const response = await dao.create(entity);

        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeDefined();
        // this implicitly tests for if the MySQL auto-incrementing ID and timestamps/dates are generated correctly
        // as else the isEntity method will not be true
        removeAutoGeneratedFieldsForEquality(response.object, entity);
        expect(response.message).toContain(`${capitalizeFirstLetter(dao.entityName)} created successfully`);
      }
    });

    test("Creation of duplicate entities throws an already exists error", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.create(entity);
        console.log(response, entity, dao.keyName);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`already exists`);
      }
    });

    // bad foreign key constraints tests for create
    function expectServerErrorResponseOnInvalidCreate(response: Response<any>, entityName: string) {
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(ServerErrorResponse);
      expect(response.statusCode).toBe(500);
      expect(response.message).toContain(`Failed to create ${entityName}`);
    }

    test("Failed location creation with invalid campus id", async () => {
      const invalidLocation = { ...dummyLocation2 };
      invalidLocation.campus_id = 100;
      const response = await locationDao.create(invalidLocation);
      expectServerErrorResponseOnInvalidCreate(response, "location");
    });

    test("Failed book creation with invalid genre id", async () => {
      const invalidBook = { ...dummyBook2 };
      invalidBook.primary_genre_id = 100;
      const response = await bookDao.create(invalidBook);
      expectServerErrorResponseOnInvalidCreate(response, "book");
    });

    test("Failed book creation with invalid audience id", async () => {
      const invalidBook = { ...dummyBook2 };
      invalidBook.audience_id = 100;
      const response = await bookDao.create(invalidBook);
      expectServerErrorResponseOnInvalidCreate(response, "book");
    });

    test("Failed book creation with invalid series id", async () => {
      const invalidBook = { ...dummyBook2 };
      invalidBook.series_id = 100;
      const response = await bookDao.create(invalidBook);
      expectServerErrorResponseOnInvalidCreate(response, "book");
    });

    test("Failed audit creation with invalid campus id", async () => {
      const invalidAudit = { ...dummyAudit2 };
      invalidAudit.campus_id = 100;
      const response = await auditDao.create(invalidAudit);
      expectServerErrorResponseOnInvalidCreate(response, "audit");
    });

    test("Failed audit_entry creation with invalid audit id", async () => {
      const invalidAudit = { ...dummyAuditEntry2 };
      invalidAudit.audit_id = 100;
      const response = await auditEntryDao.create(invalidAudit);
      expectServerErrorResponseOnInvalidCreate(response, "audit entry");
    });

    test("Failed inventory creation with invalid book id", async () => {
      const invalidInventory = { ...dummyInventory2 };
      invalidInventory.book_id = 100;
      const response = await inventoryDao.create(invalidInventory);
      expectServerErrorResponseOnInvalidCreate(response, "inventory");
    });

    test("Failed inventory creation with invalid location id", async () => {
      const invalidInventory = { ...dummyInventory2 };
      invalidInventory.location_id = 100;
      const response = await inventoryDao.create(invalidInventory);
      expectServerErrorResponseOnInvalidCreate(response, "inventory");
    });

    test("Failed inventory creation with invalid campus id", async () => {
      const invalidInventory = { ...dummyInventory2 };
      invalidInventory.campus_id = 100;
      const response = await inventoryDao.create(invalidInventory);
      expectServerErrorResponseOnInvalidCreate(response, "inventory");
    });

    test("Failed checkout creation with invalid book id", async () => {
      const invalidCheckout = { ...dummyCheckout2 };
      invalidCheckout.book_id = 100;
      const response = await checkoutDao.create(invalidCheckout);
      expectServerErrorResponseOnInvalidCreate(response, "checkout");
    });

    //TODO: the create for bookGenre entities needs to be modified

    // test("Failed bookGenre creation with invalid book id", async () => {
    //   const invalidGenres = { ...dummyBookGenre2 };
    //   invalidGenres.book_id = 100;
    //   const response = await bookGenreDao.create(invalidGenres);
    //   expectServerErrorResponseOnInvalidCreate(response, "genre");
    // });

    // test("Failed bookGenre creation with invalid genre id", async () => {
    //   const invalidGenres = { ...dummyBookGenre2 };
    //   invalidGenres.genre_id = 100;
    //   const response = await bookGenreDao.create(invalidGenres);
    //   expectServerErrorResponseOnInvalidCreate(response, "genre");
    // });

    // test("Failed bookTag creation with invalid book id", async () => {
    //   const invalidTag = { ...dummyBookTag2 };
    //   invalidTag.book_id = 100;
    //   const response = await bookTagDao.create(invalidTag);
    //   expectServerErrorResponseOnInvalidCreate(response, "tag");
    // });

    test("Failed suggestion creation with invalid campus id", async () => {
      const invalidSuggestion = { ...dummySuggestion2 };
      invalidSuggestion.campus_id = 100;
      const response = await suggestionDao.create(invalidSuggestion);
      expectServerErrorResponseOnInvalidCreate(response, "suggestion");
    });

    test("Failed user creation with invalid role id", async () => {
      const invalidUser = { ...dummyUser2 };
      invalidUser.role_id = 100;
      const response = await userDao.create(invalidUser);
      expectServerErrorResponseOnInvalidCreate(response, "user");
    });

    test("Failed user creation with invalid campus id", async () => {
      const invalidUser = { ...dummyUser2 };
      invalidUser.campus_id = 100;
      const response = await userDao.create(invalidUser);
      expectServerErrorResponseOnInvalidCreate(response, "user");
    });

    test("Failed shopping list creation with invalid book id", async () => {
      const invalidShoppingList = { ...dummyShoppingList2 };
      invalidShoppingList.book_id = 100;
      const response = await shoppingListDao.create(invalidShoppingList);
      expectServerErrorResponseOnInvalidCreate(response, "shopping item");
    });

    test("Failed shopping list creation with invalid campus id", async () => {
      const invalidShoppingList = { ...dummyShoppingList2 };
      invalidShoppingList.campus_id = 100;
      const response = await shoppingListDao.create(invalidShoppingList);
      expectServerErrorResponseOnInvalidCreate(response, "shopping item");
    });

    test("Failed restock list creation with invalid book id", async () => {
      const invalidRestockList = { ...dummyRestockList2 };
      invalidRestockList.book_id = 100;
      const response = await restockListDao.create(invalidRestockList);
      expectServerErrorResponseOnInvalidCreate(response, "restock item");
    });

    test("Failed restock list creation with invalid campus id", async () => {
      const invalidRestockList = { ...dummyRestockList2 };
      invalidRestockList.campus_id = 100;
      const response = await restockListDao.create(invalidRestockList);
      expectServerErrorResponseOnInvalidCreate(response, "restock item");
    });
  });

  describe("Get by key and value tests", () => {
    test("Successful retrieval of entities by key and value", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getByKeyAndValue(dao.keyName, entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeDefined();
        parseObjectForEquality(response.object, entity);
        expect(response.message).toContain(`${capitalizeFirstLetter(dao.entityName)} retrieved successfully`);
      }
    });

    test("Failed retrieval of entities by key and value with invalid key", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getByKeyAndValue("invalid_key", entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`Unknown column 'invalid_key' in 'where clause'`);
      }
    });

    test("Retrieval of entities by key and value with invalid value is empty", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getByKeyAndValue(dao.keyName, "invalid_value");
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`No ${dao.entityName} found with ${dao.keyName}`);
      }
    });
  });

  describe("Get all by key and value tests", () => {
    test("Successful retrieval of all entities by key and value", async () => {
      console.log("Starting tests for Base DAO functionality");
      await populateSecondDummyWave();

      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getAllByKeyAndValue(dao.keyName, entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        // the value stored at the key name is different in this db setup,
        // thus we are implicitly checking to see if the query actually matches on the value
        // by not including the second entity in the expected object
        expect(response.object).toBeDefined();
        expect(response.object.length).toBe(1);
        parseArrayForEquality(response, [entity]);
        expect(response.message).toContain(
          `${capitalizeFirstLetter(dao.entityName)}s retrieved successfully`
        );
      }
    });

    test("Failed retrieval of all entities by key and value with invalid key", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getAllByKeyAndValue("invalid_key", entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`Unknown column 'invalid_key' in 'where clause'`);
      }
    });

    test("Retrieval of all entities by key and value with invalid value is empty", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getAllByKeyAndValue(dao.keyName, "invalid_value");
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`No ${dao.entityName}s found with ${dao.keyName}`);
      }
    });
  });

  describe(`Get by primary key tests`, () => {
    test("Successful retrieval of entities by primary key", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getByPrimaryKey(entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeDefined();
        parseObjectForEquality(response.object, entity);
        expect(response.message).toContain(`${capitalizeFirstLetter(dao.entityName)} retrieved successfully`);
      }
    });

    test("Failed retrieval of entities with invalid primary key", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getByPrimaryKey("invalid_key");
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`No ${dao.entityName} found with ${dao.keyName}`);
      }
    });
  });

  describe("Get all matching on index tests", () => {
    test("Successful retrieval of all entities matching index", async () => {
      await populateSecondDummyWave();

      for (const [entityName, { entity, dao }] of entityDaoMap) {
        for (const currField of Object.keys(entity)) {
          if (!entity[currField]) {
            continue;
          }
          const response = await dao.getAllMatchingOnIndex(currField, entity[currField]);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          if (entityDaoMap2.get(entityName).entity[currField] === entity[currField]) {
            expect(response.object.length).toBe(2);
            parseArrayForEquality(response, [entity, entityDaoMap2.get(entityName).entity]);
          } else {
            expect(response.object.length).toBe(1);
            parseArrayForEquality(response, [entity]);
          }
          expect(response.message).toContain(
            `${capitalizeFirstLetter(dao.entityName)}s retrieved successfully`
          );
        }
      }
    });

    test("Failed retrieval of all entities matching index with invalid index", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getAllMatchingOnIndex("invalid_index", entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined;
        expect(response.message).toContain(`Unknown column 'invalid_index' in 'where clause`);
      }
    });

    test("Retrieval of all entities matching index with invalid value is empty", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getAllMatchingOnIndex(dao.keyName, "invalid_value");
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`No ${dao.entityName}s found`);
      }
    });
  });

  describe("Get all tests", () => {
    test("Successful retrieval of all entities", async () => {
      await populateSecondDummyWave();

      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getAll();
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeDefined();
        expect(response.object.length).toBe(2);
        parseArrayForEquality(response, [entity, entityDaoMap2.get(entityName).entity]);
        expect(response.message).toContain(
          `All rows from the ${capitalizeFirstLetter(dao.tableName)} table retrieved successfully`
        );
      }
    });

    test("Retrieval of all objects on empty table is empty", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        // stupid hack to clear a table without foreign key errors
        await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 0`);
        await TestConnectionManager.executeQuery(`TRUNCATE TABLE ${dao.tableName}`);
        await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 1`);
        const response = await dao.getAll();
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`No ${dao.entityName}s found`);

        await dao.create(entity); // to avoid foreign key constraint errors for subsequent tests
      }
    });

    test("Failed retrieval of all entities with invalid table name", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const tableName = dao.tableName;
        dao.tableName = "invalid_table";
        const response = await dao.getAll();
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(
          `Failed to retrieve all data from the ${capitalizeFirstLetter(dao.tableName)}`
        );
        dao.tableName = tableName;
      }
    });
  });

  describe("Update tests", () => {
    test("Successful update of complete entities", async () => {
      // we turn off foreign key checks for this test as the purpose of the test is to verify whether an entity has been updated,
      // not whether the entity has been updated with valid foreign keys
      await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 0`);

      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.update(entity[dao.keyName], entityDaoMap2.get(entityName).entity);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`${capitalizeFirstLetter(dao.entityName)} updated successfully`);
      }

      await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 1`);
    });

    test("Successful update of entities with nulled fields", async () => {
      await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 0`);

      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.update(entity[dao.keyName], entityDaoMapNullable.get(entityName).entity);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`${capitalizeFirstLetter(dao.entityName)} updated successfully`);
      }

      await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 1`);
    });

    test("Update with invalid key does not change database", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response =
          typeof entity[dao.keyName] === "string"
            ? await dao.update("invalid_key", entity)
            : await dao.update(-1, entity);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`No ${dao.entityName} found with ${dao.keyName}`);
      }
    });

    test("Failed update with unknown field", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const invalidUpdate = { ...entity, badField: "Avada Kedavra" };
        const response = await dao.update(entity[dao.keyName], invalidUpdate);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`Unknown field badField in ${dao.entityName}`);
      }
    });

    // TODO: add tests for foreign key constraint errors
  });

  describe("Delete tests", () => {
    test("Successful deletion of entities", async () => {
      // temporarily turn off foreign key checks because this test is just to see if you can delete an object by its key
      await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 0`);

      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.delete(entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`${capitalizeFirstLetter(dao.entityName)} deleted successfully`);
      }

      await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 1`);
    });

    test("Deletion of entities with invalid key does not modify database", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response =
          typeof entity[dao.keyName] === "string" ? await dao.delete("invalid_key") : await dao.delete(-1);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`No ${dao.entityName} found with ${dao.keyName}`);
      }
    });

    // TODO: add tests for foreign key constraint errors
  });

  describe("Delete by index and value tests", () => {
    test("Successful deletion of entities by index and value", async () => {
      // temporarily turn off foreign key checks because this test is just to see if you can delete an object by key and value
      await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 0`);

      for (const [entityName, { entity, dao }] of entityDaoMap) {
        // we're deleting on the key in this test because otherwise each test would need to be customized to check a non-key field
        // which is way more lines of code than I want to write at the moment
        const response = await dao.deleteOnIndexByValue(dao.keyName, entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(
          `${capitalizeFirstLetter(dao.entityName)}(s) deleted successfully`
        );
      }

      await TestConnectionManager.executeQuery(`SET FOREIGN_KEY_CHECKS = 1`);
    });

    test("Failed deletion of entities with invalid index", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.deleteOnIndexByValue("invalid_index", entity[dao.keyName]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`Unknown field invalid_index in ${dao.entityName}`);
      }
    });

    test("Deletion of entities with invalid value does not modify database", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response =
          typeof entity[dao.keyName] === "string"
            ? await dao.deleteOnIndexByValue(dao.keyName, "invalid_value")
            : await dao.deleteOnIndexByValue(dao.keyName, -1);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`No ${dao.entityName} found with ${dao.keyName}`);
      }
    });

    // TODO: add tests for foreign key constraint errors
  });

  // technically this test should iterate over all methods in the abstract DAO to see if they fail on transactions
  // instead of just having separate for loops for each method
  // this would ensure that new DAO methods would include the ServerErrorResponse logic
  // however, this requires reflection voodoo and is well beyond the scope of this project
  test("Transaction present in any DAO method returns a ServerErrorResponse", async () => {
    //const mockTransaction = jest.fn() as unknown as Transaction<Database>;

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.create(entity, mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getByKeyAndValue(dao.keyName, entity[dao.keyName], mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllByKeyAndValue(dao.keyName, entity[dao.keyName], mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getByPrimaryKey(entity[dao.keyName], mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllMatchingOnIndex(dao.keyName, entity[dao.keyName], mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAll(mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.update(dao.keyName, entity[dao.keyName], mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.delete(dao.keyName, mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.deleteOnIndexByValue(dao.keyName, entity[dao.keyName], mockTransaction);
      expectTransactionFailure(response);
    }
  });

  describe("DAO-specific tests (for DAOs that have their own custom queries)", () => {
    describe("BookDao tests", () => {
      let customBook: any = {
        audience_name: "Potterheads",
        series_name: "Harry Potter",
        primary_genre_name: "Fantasy",
      };

      beforeEach(async () => {
        // for some reason the spread operator doesn't work outside of a specific test context so this is a dumb workaround
        customBook = {
          ...customBook,
          ...dummyBook,
        };
      });

      describe("Get book by ISBN tests", () => {
        test("Successful retrieval of book by ISBN", async () => {
          console.log("Starting Custom DAO Testing Functions");
          const response = await bookDao.getBookByIsbn(customBook.isbn_list.split("|")[0]);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          parseObjectForEquality(response.object, customBook);
          expect(response.message).toContain(
            `Successfully retrieved book with isbn ${customBook.isbn_list.split("|")[0]}`
          );
        });

        test("Retrieval of book with invalid ISBN is empty", async () => {
          const response = await bookDao.getBookByIsbn("invalid_isbn");
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(RequestErrorResponse);
          expect(response.statusCode).toBe(404);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`No book found with isbn invalid_isbn`);
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await bookDao.getBookByIsbn(customBook.isbn_list.split("|")[0], mockTransaction);
          expectTransactionFailure(response);
        });
      });

      describe("Get book tags by ISBN tests", () => {
        test("Successful retrieval of book tags by ISBN", async () => {
          await bookDao.create(customBook);
          await bookTagDao.create(dummyBookTag);
          await tagDao.create(dummyTag);

          const { id, ...extractedTag } = dummyTag;
          const response = await bookDao.getBookTagsByIsbn(customBook.isbn_list.split("|")[0]);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          parseArrayForEquality(response, [extractedTag]);
          expect(response.message).toContain(
            `Successfully retrieved tags for book with isbn ${customBook.isbn_list.split("|")[0]}`
          );
        });

        test("Retrieval of book tags with invalid ISBN is empty", async () => {
          const response = await bookDao.getBookTagsByIsbn("invalid_isbn");
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`No book found with isbn invalid_isbn`);
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await bookDao.getBookTagsByIsbn(
            customBook.isbn_list.split("|")[0],
            mockTransaction
          );
          expectTransactionFailure(response);
        });
      });

      describe("Get book by name tests", () => {
        test("Successful retrieval of book by name", async () => {
          const response = await bookDao.getBookByName(dummyBook.book_title);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          parseObjectForEquality(response.object, dummyBook);
          expect(response.message).toContain(`Successfully retrieved book with name ${dummyBook.book_title}`);
        });

        test("Retrieval of book with invalid name is empty", async () => {
          const response = await bookDao.getBookByName("invalid_name");
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`No book found with name invalid_name`);
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await bookDao.getBookByName(dummyBook.book_title, mockTransaction);
          expectTransactionFailure(response);
        });
      });

      describe("getBasicBookByFilter tests", () => {
        test("Successful retrieval of book with valid campus and ISBN", async () => {
          const filterQueryList = [];
          const bookId = 10;
          const campus = "Hogwarts";

          const response = await bookDao.getBasicBookByFilter(filterQueryList, bookId, campus);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
        });

        test("Successful retrieval of book with filters applied", async () => {
          const filterQueryList = [{ key: "genre.genre_name", value: ["Fantasy"] }];
          const bookId = 10;
          const campus = "Hogwarts";

          const response = await bookDao.getBasicBookByFilter(filterQueryList, bookId, campus);

          expect(response).toBeDefined();
          console.log(response);
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
        });

        test("Failed retrieval with invalid campus", async () => {
          const filterQueryList = [];
          const bookId = 10;
          const campus = "InvalidCampus";

          const response = await bookDao.getBasicBookByFilter(filterQueryList, bookId, campus);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `${bookId} and campus ${campus} matching filters`
          );
        });

        test("Failed retrieval with invalid ISBN", async () => {
          const filterQueryList = [];
          const bookId = -1;
          const campus = "Hogwarts";

          const response = await bookDao.getBasicBookByFilter(filterQueryList, bookId, campus);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `${bookId} and campus ${campus} matching filters`
          );
        });

        test("Failed retrieval with invalid filters", async () => {
          const filterQueryList = [{ key: "genre.primary_genre_name", value: "InvalidGenre" }];
          const bookId = 1;
          const campus = "Hogwarts";

          const response = await bookDao.getBasicBookByFilter(filterQueryList, bookId, campus);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(ServerErrorResponse);
          expect(response.statusCode).toBe(500);
          expect(response.object).toBeUndefined();
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const filterQueryList = [];
          const bookId = 1;
          const campus = "Hogwarts";

          const response = await bookDao.getBasicBookByFilter(filterQueryList, bookId, campus, mockTransaction);
          expectTransactionFailure(response);
        });
      });

      describe("Get all ISBNs tests", () => {
        // These tests should be written a little more carefully to check if multiple ISBN lists can be coalesced into the array
        // but for right now I don't want to deal with that
        test("Successful retrieval of all bookData with valid campus", async () => {
          const filterQueryList = [];
          const campus = "Hogwarts";

          const response = await bookDao.getAllBooksMatchingFilter(filterQueryList, campus);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          expect(response.message).toContain(
            `Successfully retrieved all books on campus ${campus} matching filters`
          );
        });

        test("Successful retrieval of all ISBNs with filters applied", async () => {
          const filterQueryList = [
            { key: "genre.genre_name", value: ["Fantasy"] },
            { key: "audiences.audience_name", value: ["Potterheads"] },
          ];
          const campus = "Hogwarts";

          const response = await bookDao.getAllBooksMatchingFilter(filterQueryList, campus);
          // console.log(response);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          expect(response.message).toContain(
            `Successfully retrieved all books on campus ${campus} matching filters`
          );
        });

        test("Failed retrieval with invalid campus", async () => {
          const filterQueryList = [];
          const campus = "InvalidCampus";

          const response = await bookDao.getAllBooksMatchingFilter(filterQueryList, campus);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`No books found on campus ${campus} matching provided filters`);
        });

        test("Failed retrieval with invalid filters", async () => {
          const filterQueryList = [
            { key: "genre.primary_genre_name", value: "InvalidGenre" },
            { key: "audiences.audience_name", value: "InvalidAudience" },
          ];
          const campus = "Hogwarts";

          const response = await bookDao.getAllBooksMatchingFilter(filterQueryList, campus);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(ServerErrorResponse);
          expect(response.statusCode).toBe(500);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`isbns`);
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const filterQueryList = [];
          const campus = "Hogwarts";

          const response = await bookDao.getAllBooksMatchingFilter(filterQueryList, campus, mockTransaction);
          expectTransactionFailure(response);
        });
      });
    });

    describe("CheckoutDao tests", () => {
      describe("Checkin tests", () => {
        test("Successful deletion from checkout database on checkin", async () => {
          const response = await checkoutDao.checkin(dummyCheckout.qr);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `${capitalizeFirstLetter(checkoutDao.entityName)} deleted successfully`
          );
        });

        test("Checkout of nonexistent QR code does not modify database", async () => {
          const response = await checkoutDao.checkin("invalid_qr");
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`No checkout found with qr code invalid_qr to remove`);
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await checkoutDao.checkin(dummyCheckout.qr, mockTransaction);
          expectTransactionFailure(response);
        });
      });
    });

    describe("InventoryDao tests", () => {
      describe("Checkout tests", () => {
        //No longer deleting inventory on checkout because of audit foreign key constraint

        // test("Successful deletion of inventory item on checkout", async () => {
        //   const response = await inventoryDao.checkout(dummyInventory.qr, dummyInventory.campus_id);
        //   console.log(response);
        //   expect(response).toBeDefined();
        //   expect(response).toBeInstanceOf(SuccessResponse);
        //   expect(response.statusCode).toBe(200);
        //   expect(response.object).toBeUndefined();
        //   expect(response.message).toContain(`${dummyInventory.qr} checked out successfully`);
        // });

        test("Checkout of nonexistent QR code does not modify database", async () => {
          const response = await inventoryDao.checkout("invalid_qr", dummyInventory.campus_id);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `Inventory with qr invalid_qr and campus id ${dummyInventory.campus_id} not found to check out`
          );
        });

        test("Checkout of nonexistent campus id does not modify database", async () => {
          const response = await inventoryDao.checkout(dummyInventory.qr, 100);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `Inventory with qr ${dummyInventory.qr} and campus id 100 not found to check out`
          );
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await inventoryDao.checkout(
            dummyInventory.qr,
            dummyInventory.campus_id,
            mockTransaction
          );
          expectTransactionFailure(response);
        });
      });

      describe("Get book data from QR tests", () => {
        test("Successful retrieval of book data with valid QR code", async () => {
          dummyInventory.ttl = undefined; // we're getting rid of this field later anyways
          const response = await inventoryDao.getBookDataFromQr(dummyInventory.qr);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          expect(response.object).toEqual({
            ...dummyInventory,
            location_name: dummyLocation.location_name,
            campus_name: dummyCampus.campus_name,
            book_title: dummyBook.book_title,
            author: dummyBook.author,
            series_id: dummyBook.series_id,
            series_name: dummySeries.series_name,
            primary_genre_id: dummyGenre.id,
            primary_genre_name: dummyGenre.genre_name,
            isbn_list: dummyBook.isbn_list,
          });
          expect(response.message).toContain(
            `Book data successfully retrieved for QR code ${dummyInventory.qr}`
          );

          dummyInventory.ttl = 10; // reset the field for now
        });

        test("Book data retrieval with invalid QR code is nonexistent", async () => {
          const response = await inventoryDao.getBookDataFromQr("invalid_qr");

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`No book data found for QR code invalid_qr`);
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await inventoryDao.getBookDataFromQr(dummyInventory.qr, mockTransaction);
          expectTransactionFailure(response);
        });
      });

      describe("Set location tests", () => {
        test("Successful update of location with valid QR code", async () => {
          await campusDao.create(dummyCampus2);
          await locationDao.create(dummyLocation2);

          const qr = dummyInventory.qr;
          const newLocation = dummyLocation2.id;

          const response = await inventoryDao.setLocation(qr, newLocation);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined(); // because nothing is returned here there's not a good way to know if the db was actually updated
          expect(response.message).toContain("Set location for qr successfully");
        });

        test("Update with invalid QR code does not modify database", async () => {
          const qr = "invalid_qr";
          const newLocation = dummyLocation2.id;

          const response = await inventoryDao.setLocation(qr, newLocation);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.message).toContain(`No inventory found with qr ${qr} to update`);
        });

        test("Failed update with invalid location id", async () => {
          const qr = dummyInventory.qr;
          const newLocation = 100;

          const response = await inventoryDao.setLocation(qr, newLocation);

          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(ServerErrorResponse);
          expect(response.statusCode).toBe(500);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`Error occurred during set location query: `);
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const qr = dummyInventory.qr;
          const newLocation = dummyLocation2.id;

          const response = await inventoryDao.setLocation(qr, newLocation, mockTransaction);
          expectTransactionFailure(response);
        });
      });
    });

    describe("RestockListDao tests", () => {
      describe("Add restock list item tests", () => {
        test("Successful addition of restock item to restock list", async () => {
          const response = await restockListDao.addRestockListItem(dummyRestockList);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          expect(response.object).toEqual(dummyRestockList);
          expect(response.message).toContain(
            `${capitalizeFirstLetter(restockListDao.entityName)} created/updated successfully`
          );
        });

        test("Duplicate book id updates entire row entry", async () => {
          await restockListDao.addRestockListItem(dummyRestockList);
          dummyRestockList2.book_id = dummyRestockList.book_id;
          dummyRestockList2.campus_id = dummyRestockList.campus_id;
          const response = await restockListDao.addRestockListItem(dummyRestockList2);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeDefined();
          expect(response.object).toEqual({
            ...dummyRestockList2,
          });
          expect(response.message).toContain(
            `${capitalizeFirstLetter(restockListDao.entityName)} created/updated successfully`
          );

          dummyRestockList2.book_id = 12;
        });

        test("Failed add of restock item with invalid book id", async () => {
          const invalidRestockList = { ...dummyRestockList };
          invalidRestockList.book_id = 100;
          const response = await restockListDao.addRestockListItem(invalidRestockList);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(ServerErrorResponse);
          expect(response.statusCode).toBe(500);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`Failed to create restock item with error`);
        });

        test("Failed add of restock item with invalid campus id", async () => {
          const invalidRestockList = { ...dummyRestockList };
          invalidRestockList.campus_id = 100;
          const response = await restockListDao.addRestockListItem(invalidRestockList);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(ServerErrorResponse);
          expect(response.statusCode).toBe(500);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(`Invalid campus_id 100. Campus does not exist.`);
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await restockListDao.addRestockListItem(dummyRestockList, mockTransaction);
          expectTransactionFailure(response);
        });
      });

      describe("Delete restock list item tests", () => {
        test("Successful deletion of restock item from restock list", async () => {
          await restockListDao.addRestockListItem(dummyRestockList);
          const response = await restockListDao.deleteRestockListItem(
            dummyRestockList.book_id,
            dummyRestockList.campus_id
          );
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `Restock item with book id ${dummyRestockList.book_id} and campus id ${dummyRestockList.campus_id} removed successfully`
          );
        });

        test("Deletion of restock list item with nonexistent book id does not modify database", async () => {
          const response = await restockListDao.deleteRestockListItem(100, dummyRestockList.campus_id);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `Restock item with book id 100 and campus id ${dummyRestockList.campus_id} not found to remove`
          );
        });

        test("Deletion of restock list item with nonexistent campus id does not modify database", async () => {
          await restockListDao.addRestockListItem(dummyRestockList);
          const response = await restockListDao.deleteRestockListItem(dummyRestockList.book_id, 100);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `Restock item with book id ${dummyRestockList.book_id} and campus id 100 not found to remove`
          );
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await restockListDao.deleteRestockListItem(
            dummyRestockList.book_id,
            dummyRestockList.campus_id,
            mockTransaction
          );
          expectTransactionFailure(response);
        });
      });
    });

    describe("ShoppingListDao tests", () => {
      describe("Delete shopping list item tests", () => {
        test("Successful deletion of shopping item from shopping list", async () => {
          const response = await shoppingListDao.deleteShoppingListItem(
            dummyShoppingList.book_id,
            dummyShoppingList.campus_id
          );
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `Shopping item with book id ${dummyShoppingList.book_id} and campus id ${dummyShoppingList.campus_id} removed successfully`
          );
        });

        test("Deletion of shopping list item with nonexistent book id does not modify database", async () => {
          const response = await shoppingListDao.deleteShoppingListItem(100, dummyShoppingList.campus_id);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `Shopping item with book id 100 and campus id ${dummyShoppingList.campus_id} not found to remove`
          );
        });

        test("Deletion of shopping list item with nonexistent campus id does not modify database", async () => {
          const response = await shoppingListDao.deleteShoppingListItem(dummyShoppingList.book_id, 100);
          expect(response).toBeDefined();
          expect(response).toBeInstanceOf(SuccessResponse);
          expect(response.statusCode).toBe(200);
          expect(response.object).toBeUndefined();
          expect(response.message).toContain(
            `Shopping item with book id ${dummyShoppingList.book_id} and campus id 100 not found to remove`
          );
        });

        test("Transaction returns a ServerErrorResponse", async () => {
          const response = await shoppingListDao.deleteShoppingListItem(
            dummyShoppingList.book_id,
            dummyShoppingList.campus_id,
            mockTransaction
          );
          expectTransactionFailure(response);
        });
      });
    });
  });
});
