import { Transaction } from "kysely";
import AudienceDao from "../../../src/db/dao/AudienceDao";
import AuditDao from "../../../src/db/dao/AuditDao";
import AuditStateDao from "../../../src/db/dao/AuditStateDao";
import BookDao from "../../../src/db/dao/BookDao";
import CampusDao from "../../../src/db/dao/CampusDao";
import CheckoutDao from "../../../src/db/dao/CheckoutDao";
import Dao from "../../../src/db/dao/Dao";
import DaoFactory from "../../../src/db/dao/DaoFactory";
import GenresDao from "../../../src/db/dao/GenresDao";
import GenreTypeDao from "../../../src/db/dao/GenreTypeDao";
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
import { AuditState } from "../../../src/db/schema/AuditState";
import { Book } from "../../../src/db/schema/Book";
import { Campus } from "../../../src/db/schema/Campus";
import { Checkout } from "../../../src/db/schema/Checkout";
import { Genres } from "../../../src/db/schema/Genres";
import { GenreType } from "../../../src/db/schema/GenreType";
import { Inventory } from "../../../src/db/schema/Inventory";
import { Location } from "../../../src/db/schema/Location";
import { RestockList } from "../../../src/db/schema/RestockList";
import { Series } from "../../../src/db/schema/Series";
import { ShoppingList } from "../../../src/db/schema/ShoppingList";
import { Suggestion } from "../../../src/db/schema/Suggestion";
import { Tag } from "../../../src/db/schema/Tag";
import { User } from "../../../src/db/schema/User";
import { UserRole } from "../../../src/db/schema/UserRole";
import Response from "../../../src/response/Response";
import ServerErrorResponse from "../../../src/response/ServerErrorResponse";
import SuccessResponse from "../../../src/response/SuccessResponse";
import TestConnectionManager from "../../TestConnectionManager";
import Database from "../../../src/db/schema/Database";

// NOTE: This testing suite assumes that data already comes in with the right fields, which should largely be parsed/checked in the handlers

describe("DAO testing suite", () => {
  let daoFactory: DaoFactory;
  let audienceDao: AudienceDao;
  let auditDao: AuditDao;
  let auditStateDao: AuditStateDao;
  let bookDao: BookDao;
  let campusDao: CampusDao;
  let checkoutDao: CheckoutDao;
  let genresDao: GenresDao;
  let genreTypeDao: GenreTypeDao;
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

  let dummyAuditState: AuditState;
  let dummyAuditState2: AuditState;
  let dummyAuditStateNullable: AuditState;

  let dummyBook: Book;
  let dummyBook2: Book;
  let dummyBookNullable: Book;

  let dummyCampus: Campus;
  let dummyCampus2: Campus;
  let dummyCampusNullable: Campus;

  let dummyCheckout: Checkout;
  let dummyCheckout2: Checkout;
  let dummyCheckoutNullable: Checkout;

  let dummyGenres: Genres;
  let dummyGenres2: Genres;
  let dummyGenresNullable: Genres;

  let dummyGenreType: GenreType;
  let dummyGenreType2: GenreType;
  let dummyGenreType3: GenreType;
  let dummyGenreType4: GenreType;
  let dummyGenreType5: GenreType;
  let dummyGenreType6: GenreType;
  let dummyGenreTypeNullable: GenreType;

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

  let dummyTag: Tag;
  let dummyTag2: Tag;
  let dummyTagNullable: Tag;

  let dummyUser: User;
  let dummyUser2: User;
  let dummyUserNullable: User;

  let dummyUserRole: UserRole;
  let dummyUserRole2: UserRole;
  let dummyUserRoleNullable: UserRole;

  beforeAll(async () => {
    console.log("Setting up test environment");
    await TestConnectionManager.initialize();
    console.log("Test database connection established");
    await TestConnectionManager.runCreateTestSQL();
    console.log("Creation of test database schema complete");

    daoFactory = new DaoFactory(TestConnectionManager.kyselyDB);
    audienceDao = daoFactory.getAudienceDao();
    auditDao = daoFactory.getAuditDao();
    auditStateDao = daoFactory.getAuditStateDao();
    bookDao = daoFactory.getBookDao();
    campusDao = daoFactory.getCampusDao();
    checkoutDao = daoFactory.getCheckoutDao();
    genresDao = daoFactory.getGenresDao();
    genreTypeDao = daoFactory.getGenreTypeDao();
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
      book_id: 10,
      state_id: 10,
      expected_amount: 10,
      actual_amount: 10,
    };

    dummyAudit2 = {
      book_id: 12,
      state_id: 12,
      expected_amount: 5,
      actual_amount: 5,
    };

    dummyAuditNullable = {
      book_id: 11, // this should be the first ID generated by a book without a known ID
      state_id: 11, // this should be the first ID generated by an audit state without a known ID
    };

    dummyAuditState = {
      id: 10,
      audit_state_name: "Located",
    };

    dummyAuditState2 = {
      id: 12,
      audit_state_name: "Missing",
    };

    dummyAuditStateNullable = {
      audit_state_name: "Unknown",
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

    dummyGenres = {
      book_id: 10,
      genre_id_1: 10,
      genre_id_2: 11,
      genre_id_3: 12,
    };

    dummyGenres2 = {
      book_id: 12,
      genre_id_1: 13,
      genre_id_2: 14,
      genre_id_3: 15,
    };

    dummyGenresNullable = {
      book_id: 11, // this should be the first ID generated by a book without a known ID
      genre_id_1: 13, // this should be the first ID generated by a genre type without a known ID
    };

    dummyGenreType = {
      id: 10,
      genre_name: "Fantasy",
    };

    dummyGenreType2 = {
      id: 11,
      genre_name: "Adventure",
    };

    dummyGenreType3 = {
      id: 12,
      genre_name: "Mystery",
    };

    dummyGenreType4 = {
      id: 13,
      genre_name: "Horror",
    };

    dummyGenreType5 = {
      id: 14,
      genre_name: "Thriller",
    };

    dummyGenreType6 = {
      id: 15,
      genre_name: "Romance",
    };

    dummyGenreTypeNullable = {
      // implicitly has id of 13 in most test contexts
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

    dummyTag = {
      id: 10,
      book_id: 10,
      tag: "Hairy Porter",
    };

    dummyTag2 = {
      id: 12,
      book_id: 12,
      tag: "Secrets of the Chamber",
    };

    dummyTagNullable = {
      book_id: 11, // this should be the first ID generated by a book without a known ID
      tag: "Askaban's Prisoner",
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
      ["Audit_state", { entity: dummyAuditState, dao: auditStateDao }],
      ["Genre_type", { entity: dummyGenreType, dao: genreTypeDao }],
      ["Genre_type_2", { entity: dummyGenreType2, dao: genreTypeDao }],
      ["Genre_type_3", { entity: dummyGenreType3, dao: genreTypeDao }],
      ["Series", { entity: dummySeries, dao: seriesDao }],
      ["User_role", { entity: dummyUserRole, dao: userRoleDao }],
      ["Campus", { entity: dummyCampus, dao: campusDao }],
      ["Location", { entity: dummyLocation, dao: locationDao }],
      ["Book", { entity: dummyBook, dao: bookDao }],
      ["Audit", { entity: dummyAudit, dao: auditDao }],
      ["Inventory", { entity: dummyInventory, dao: inventoryDao }],
      ["Checkout", { entity: dummyCheckout, dao: checkoutDao }],
      ["Genres", { entity: dummyGenres, dao: genresDao }],
      ["Tag", { entity: dummyTag, dao: tagDao }],
      ["Suggestion", { entity: dummySuggestion, dao: suggestionDao }],
      ["User", { entity: dummyUser, dao: userDao }],
      ["Shopping_list", { entity: dummyShoppingList, dao: shoppingListDao }],
      ["Restock_list", { entity: dummyRestockList, dao: restockListDao }],
    ]);

    // order similarly matters here
    entityDaoMap2 = new Map([
      ["Audience", { entity: dummyAudience2, dao: audienceDao }],
      ["Audit_state", { entity: dummyAuditState2, dao: auditStateDao }],
      ["Genre_type", { entity: dummyGenreType4, dao: genreTypeDao }],
      ["Genre_type_2", { entity: dummyGenreType5, dao: genreTypeDao }],
      ["Genre_type_3", { entity: dummyGenreType6, dao: genreTypeDao }],
      ["Series", { entity: dummySeries2, dao: seriesDao }],
      ["User_role", { entity: dummyUserRole2, dao: userRoleDao }],
      ["Campus", { entity: dummyCampus2, dao: campusDao }],
      ["Location", { entity: dummyLocation2, dao: locationDao }],
      ["Book", { entity: dummyBook2, dao: bookDao }],
      ["Audit", { entity: dummyAudit2, dao: auditDao }],
      ["Inventory", { entity: dummyInventory2, dao: inventoryDao }],
      ["Checkout", { entity: dummyCheckout2, dao: checkoutDao }],
      ["Genres", { entity: dummyGenres2, dao: genresDao }],
      ["Tag", { entity: dummyTag2, dao: tagDao }],
      ["Suggestion", { entity: dummySuggestion2, dao: suggestionDao }],
      ["User", { entity: dummyUser2, dao: userDao }],
      ["Shopping_list", { entity: dummyShoppingList2, dao: shoppingListDao }],
      ["Restock_list", { entity: dummyRestockList2, dao: restockListDao }],
    ]);

    entityDaoMapNullable = new Map([
      ["Audience", { entity: dummyAudienceNullable, dao: audienceDao }],
      ["Audit_state", { entity: dummyAuditStateNullable, dao: auditStateDao }],
      ["Genre_type", { entity: dummyGenreTypeNullable, dao: genreTypeDao }],
      ["Series", { entity: dummySeriesNullable, dao: seriesDao }],
      ["User_role", { entity: dummyUserRoleNullable, dao: userRoleDao }],
      ["Campus", { entity: dummyCampusNullable, dao: campusDao }],
      ["Location", { entity: dummyLocationNullable, dao: locationDao }],
      ["Book", { entity: dummyBookNullable, dao: bookDao }],
      ["Audit", { entity: dummyAuditNullable, dao: auditDao }],
      ["Inventory", { entity: dummyInventoryNullable, dao: inventoryDao }],
      ["Checkout", { entity: dummyCheckoutNullable, dao: checkoutDao }],
      ["Genres", { entity: dummyGenresNullable, dao: genresDao }],
      ["Tag", { entity: dummyTagNullable, dao: tagDao }],
      ["Suggestion", { entity: dummySuggestionNullable, dao: suggestionDao }],
      ["User", { entity: dummyUserNullable, dao: userDao }],
      ["Shopping_list", { entity: dummyShoppingListNullable, dao: shoppingListDao }],
      ["Restock_list", { entity: dummyRestockListNullable, dao: restockListDao }],
    ]);
  });

  afterAll(async () => {
    await TestConnectionManager.teardownDb();
    await TestConnectionManager.closeConnection();
  });

  beforeEach(async () => {
    // reset test database
    await TestConnectionManager.runCreateTestSQL();
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      await dao.create(entity); // this is tested separately
    }
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
    return "book_id" in object && "last_audit_date" in object && "state_id" in object;
  }

  function isAuditState(object: any): object is AuditState {
    return "id" in object && "audit_state_name" in object;
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

  function isGenres(object: any): object is Genres {
    return "book_id" in object && "genre_id_1" in object;
  }

  function isGenreType(object: any): object is GenreType {
    return "id" in object && "genre_name" in object;
  }

  function isInventory(object: any): object is Inventory {
    return (
      "qr" in object && "book_id" in object && "location_id" in object && "campus_id" in object
    );
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
    return (
      "suggestion_id" in object &&
      "timestamp" in object &&
      "content" in object &&
      "campus_id" in object
    );
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
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toBeDefined();
        parseObjectForEquality(response.object, entity);
        expect(response.message).toContain(
          `${capitalizeFirstLetter(dao.entityName)} created successfully`
        );
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
        expect(response.message).toContain(
          `${capitalizeFirstLetter(dao.entityName)} created successfully`
        );
      }
    });

    test("Creation of duplicate entities throws an already exists error", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.create(entity);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(`${entity[dao.keyName]} already exists`);
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

    test("Failed audit creation with invalid book id", async () => {
      const invalidAudit = { ...dummyAudit2 };
      invalidAudit.book_id = 100;
      const response = await auditDao.create(invalidAudit);
      expectServerErrorResponseOnInvalidCreate(response, "audit");
    });

    test("Failed audit creation with invalid state id", async () => {
      const invalidAudit = { ...dummyAudit2 };
      invalidAudit.state_id = 100;
      const response = await auditDao.create(invalidAudit);
      expectServerErrorResponseOnInvalidCreate(response, "audit");
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

    test("Failed genres creation with invalid book id", async () => {
      const invalidGenres = { ...dummyGenres2 };
      invalidGenres.book_id = 100;
      const response = await genresDao.create(invalidGenres);
      expectServerErrorResponseOnInvalidCreate(response, "genre");
    });

    test("Failed genres creation with invalid first genre id", async () => {
      const invalidGenres = { ...dummyGenres2 };
      invalidGenres.genre_id_1 = 100;
      const response = await genresDao.create(invalidGenres);
      expectServerErrorResponseOnInvalidCreate(response, "genre");
    });

    test("Failed genres creation with invalid second genre id", async () => {
      const invalidGenres = { ...dummyGenres2 };
      invalidGenres.genre_id_2 = 100;
      const response = await genresDao.create(invalidGenres);
      expectServerErrorResponseOnInvalidCreate(response, "genre");
    });

    test("Failed genres creation with invalid third genre id", async () => {
      const invalidGenres = { ...dummyGenres2 };
      invalidGenres.genre_id_3 = 100;
      const response = await genresDao.create(invalidGenres);
      expectServerErrorResponseOnInvalidCreate(response, "genre");
    });

    test("Failed tag creation with invalid book id", async () => {
      const invalidTag = { ...dummyTag2 };
      invalidTag.book_id = 100;
      const response = await tagDao.create(invalidTag);
      expectServerErrorResponseOnInvalidCreate(response, "tag");
    });

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
        expect(response.message).toContain(
          `${capitalizeFirstLetter(dao.entityName)} retrieved successfully`
        );
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
        expect(response.message).toContain(
          `${capitalizeFirstLetter(dao.entityName)} retrieved successfully`
        );
      }
    });

    test("Failed retrieval of entities with invalid primary key", async () => {
      for (const [entityName, { entity, dao }] of entityDaoMap) {
        const response = await dao.getByPrimaryKey("invalid_key");
        console.log(response);
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
          console.log(`Testing ${dao.entityName} retrieval on index ${currField}`);
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
        if (dao.tableName === "genre_types") {
          expect(response.object.length).toBe(6);
          parseArrayForEquality(response, [
            dummyGenreType,
            dummyGenreType2,
            dummyGenreType3,
            dummyGenreType4,
            dummyGenreType5,
            dummyGenreType6,
          ]);
        } else {
          expect(response.object.length).toBe(2);
          parseArrayForEquality(response, [entity, entityDaoMap2.get(entityName).entity]);
        }
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
        dao.tableName = "invalid_table";
        const response = await dao.getAll();
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(ServerErrorResponse);
        expect(response.statusCode).toBe(500);
        expect(response.object).toBeUndefined();
        expect(response.message).toContain(
          `Failed to retrieve all data from the ${capitalizeFirstLetter(dao.tableName)}`
        );
      }
    });
  });

  describe("Update tests", () => {});

  describe("Delete tests", () => {});

  describe("Delete by key and value tests", () => {});

  // technically this test should iterate over all methods in the abstract DAO to see if they fail on transactions
  // instead of just having separate for loops for each method
  // this would ensure that new DAO methods would include the ServerErrorResponse logic
  // however, this requires reflection voodoo and is well beyond the scope of this project
  test("Transaction present in any DAO method returns a ServerErrorResponse", async () => {
    const mockTransaction = jest.fn() as unknown as Transaction<Database>;

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.create(entity, mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getByKeyAndValue(
        dao.keyName,
        entity[dao.keyName],
        mockTransaction
      );
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllByKeyAndValue(
        dao.keyName,
        entity[dao.keyName],
        mockTransaction
      );
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getByPrimaryKey(entity[dao.keyName], mockTransaction);
      expectTransactionFailure(response);
    }

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllMatchingOnIndex(
        dao.keyName,
        entity[dao.keyName],
        mockTransaction
      );
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
      const response = await dao.deleteByKeyAndValue(
        dao.keyName,
        entity[dao.keyName],
        mockTransaction
      );
      expectTransactionFailure(response);
    }
  });

  describe("DAO-specific tests (for DAOs that have their own custom queries)", () => {
    describe("BookDao tests", () => {});

    describe("CampusDao tests", () => {});

    describe("CheckoutDao tests", () => {});

    describe("GenreTypeDao tests", () => {});

    describe("InventoryDao tests", () => {});

    describe("RestockListDao tests", () => {});

    describe("ShoppingListDao tests", () => {});

    describe("SuggestionDao tests", () => {});
  });
});
