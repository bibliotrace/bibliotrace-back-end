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

  let dummyAudience: Audience;
  let dummyAudience2: Audience;
  let dummyAudit: Audit;
  let dummyAudit2: Audit;
  let dummyAuditState: AuditState;
  let dummyAuditState2: AuditState;
  let dummyBook: Book;
  let dummyBook2: Book;
  let dummyCampus: Campus;
  let dummyCampus2: Campus;
  let dummyCheckout: Checkout;
  let dummyCheckout2: Checkout;
  let dummyGenres: Genres;
  let dummyGenres2: Genres;
  let dummyGenreType: GenreType;
  let dummyGenreType2: GenreType;
  let dummyGenreType3: GenreType;
  let dummyGenreType4: GenreType;
  let dummyGenreType5: GenreType;
  let dummyGenreType6: GenreType;
  let dummyInventory: Inventory;
  let dummyInventory2: Inventory;
  let dummyLocation: Location;
  let dummyLocation2: Location;
  let dummyRestockList: RestockList;
  let dummyRestockList2: RestockList;
  let dummySeries: Series;
  let dummySeries2: Series;
  let dummyShoppingList: ShoppingList;
  let dummyShoppingList2: ShoppingList;
  let dummySuggestion: Suggestion;
  let dummySuggestion2: Suggestion;
  let dummyTag: Tag;
  let dummyTag2: Tag;
  let dummyUser: User;
  let dummyUser2: User;
  let dummyUserRole: UserRole;
  let dummyUserRole2: UserRole;

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
      id: 11,
      audience_name: "Muggles",
    };

    dummyAudit = {
      book_id: 10,
      last_audit_date: "2021-01-01",
      state_id: 10,
      expected_amount: 10,
      actual_amount: 10,
    };

    dummyAudit2 = {
      book_id: 11,
      last_audit_date: "2021-02-01",
      state_id: 11,
      expected_amount: 5,
      actual_amount: 5,
    };

    dummyAuditState = {
      id: 10,
      audit_state_name: "Located",
    };

    dummyAuditState2 = {
      id: 11,
      audit_state_name: "Missing",
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
      id: 11,
      book_title: "Harry Potter and the Chamber of Secrets",
      isbn_list: "9780747538486|9780747538486",
      author: "J.K. Rowling",
      primary_genre_id: 11,
      audience_id: 11,
      pages: 341,
      series_id: 11,
      series_number: 2,
      publish_date: 1998, // YYYY
      short_description:
        "Harry Potter and the Chamber of Secrets continues the adventures of Harry as he returns to Hogwarts for his second year. He and his friends investigate a series of mysterious attacks on students and uncover the dark history of the Chamber of Secrets.",
      language: "English",
      img_callback: "https://www.example.com/harry_potter_2.jpg",
    };

    dummyCampus = {
      id: 10,
      campus_name: "Hogwarts",
    };

    dummyCampus2 = {
      id: 11,
      campus_name: "Beauxbatons",
    };

    dummyCheckout = {
      timestamp: "2000-01-01 12:00:00", // YYYY-MM-DD HH:MM:SS
      qr: "aa1111",
      book_id: 10,
      state: "First",
    };

    dummyCheckout2 = {
      timestamp: "2000-02-01 12:00:00", // YYYY-MM-DD HH:MM:SS
      qr: "bb2222",
      book_id: 11,
      state: "In",
    };

    dummyGenres = {
      book_id: 10,
      genre_id_1: 10,
      genre_id_2: 11,
      genre_id_3: 12,
    };

    dummyGenres2 = {
      book_id: 11,
      genre_id_1: 13,
      genre_id_2: 14,
      genre_id_3: 15,
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

    dummyInventory = {
      qr: "aa1111",
      book_id: 10,
      location_id: 10,
      campus_id: 10,
      ttl: 10,
    };

    dummyInventory2 = {
      qr: "bb2222",
      book_id: 11,
      location_id: 11,
      campus_id: 11,
      ttl: 20,
    };

    dummyLocation = {
      id: 10,
      campus_id: 10,
      location_name: "Room of Requirement",
    };

    dummyLocation2 = {
      id: 11,
      campus_id: 11,
      location_name: "Great Hall",
    };

    dummyRestockList = {
      book_id: 10,
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      campus_id: 10,
      quantity: 10,
    };

    dummyRestockList2 = {
      book_id: 11,
      title: "Harry Potter and the Chamber of Secrets",
      author: "J.K. Rowling",
      campus_id: 11,
      quantity: 5,
    };

    dummySeries = {
      id: 10,
      series_name: "Harry Potter",
      max_count: 10,
    };

    dummySeries2 = {
      id: 11,
      series_name: "Fantastic Beasts",
      max_count: 5,
    };

    dummyShoppingList = {
      book_id: 10,
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      campus_id: 10,
    };

    dummyShoppingList2 = {
      book_id: 11,
      title: "Harry Potter and the Chamber of Secrets",
      author: "J.K. Rowling",
      campus_id: 11,
    };

    dummySuggestion = {
      timestamp: "2000-01-01 12:00:00", //YYYY-MM-DD HH:MM:SS
      content: "Add Harry Potter and the Philosopher's Stone to the library pls",
      campus_id: 10,
    };

    dummySuggestion2 = {
      timestamp: "2000-02-01 12:00:00", //YYYY-MM-DD HH:MM:SS
      content: "Add Harry Potter and the Chamber of Secrets to the library pls",
      campus_id: 11,
    };

    dummyTag = {
      id: 10,
      book_id: 10,
      tag: "Hairy Porter",
    };

    dummyTag2 = {
      id: 11,
      book_id: 11,
      tag: "Chamber Secrets",
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
      role_id: 11,
      email: "hermione@granger.com",
      campus_id: 11,
    };

    dummyUserRole = {
      id: 10,
      role_name: "Student",
    };

    dummyUserRole2 = {
      id: 11,
      role_name: "Teacher",
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

  function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Create tests
  test("Successful creation of new entities", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap2) {
      const response = await dao.create(entity);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual(entity);
      expect(response.message).toContain(
        `${capitalizeFirstLetter(dao.entityName)} created successfully`
      );
    }
  });

  test.only("Creation of duplicate entities throws an error", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.create(entity);
      console.log(response);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(ServerErrorResponse);
      expect(response.statusCode).toBe(500);
      expect(response.object).toBeUndefined();
      expect(response.message).toContain(`${entity[dao.keyName]} already exists`);
    }
  });

  test("Failed creation of entities with missing required fields", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap2) {
      const invalidEntity = { ...entity };
      delete invalidEntity[dao.keyName]; // yeet one of the fields that the dao needs
      const response = await dao.create(invalidEntity);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(ServerErrorResponse);
      expect(response.statusCode).toBe(500);
      expect(response.message).toContain(`Failed to create ${dao.entityName}`);
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
    expectServerErrorResponseOnInvalidCreate(response, "shopping_item");
  });

  test("Failed shopping list creation with invalid campus id", async () => {
    const invalidShoppingList = { ...dummyShoppingList2 };
    invalidShoppingList.campus_id = 100;
    const response = await shoppingListDao.create(invalidShoppingList);
    expectServerErrorResponseOnInvalidCreate(response, "shopping_item");
  });

  test("Failed restock list creation with invalid book id", async () => {
    const invalidRestockList = { ...dummyRestockList2 };
    invalidRestockList.book_id = 100;
    const response = await restockListDao.create(invalidRestockList);
    expectServerErrorResponseOnInvalidCreate(response, "restock_item");
  });

  test("Failed restock list creation with invalid campus id", async () => {
    const invalidRestockList = { ...dummyRestockList2 };
    invalidRestockList.campus_id = 100;
    const response = await restockListDao.create(invalidRestockList);
    expectServerErrorResponseOnInvalidCreate(response, "restock_item");
  });

  // getByKeyAndValue tests
  test("Successful retrieval of entities by key and value", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getByKeyAndValue(dao.keyName, entity[dao.keyName]);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual(entity);
      expect(response.message).toContain(`${entityName} retrieved successfully`);
    }
  });

  test("Retrieval of entities by key and value with invalid key is empty", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getByKeyAndValue("invalid_key", entity[dao.keyName]);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toBeUndefined();
      expect(response.message).toContain(`No ${dao.entityName} found with ${dao.keyName}`);
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

  // getAllByKeyAndValue tests
  test("Successful retrieval of all entities by key and value", async () => {
    await populateSecondDummyWave();

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllByKeyAndValue(dao.keyName, entity[dao.keyName]);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual([entity, entityDaoMap2.get(entityName).entity]);
      expect(response.message).toContain(`${entityName}s retrieved successfully`);
    }
  });

  test("Retrieval of all entities by key and value with invalid key is empty", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllByKeyAndValue("invalid_key", entity[dao.keyName]);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual([]);
      expect(response.message).toContain(`No ${dao.entityName}s found with ${dao.keyName}`);
    }
  });

  test("Retrieval of all entities by key and value with invalid value is empty", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllByKeyAndValue(dao.keyName, "invalid_value");
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual([]);
      expect(response.message).toContain(`No ${dao.entityName}s found with ${dao.keyName}`);
    }
  });

  // getByPrimaryKey tests
  test("Successful retrieval of entities by primary key", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getByPrimaryKey(entity[dao.keyName]);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual(entity);
      expect(response.message).toContain(`${entityName} retrieved successfully`);
    }
  });

  test("Retrieval of entities with unknown primary key does not have object", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getByPrimaryKey("unknown_key");
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toBeUndefined();
      expect(response.message).toContain(`No ${dao.entityName} found with ${dao.keyName}`);
    }
  });

  // getAllOnIndex tests
  test("Successful retrieval of all entities on index", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      for (const currField of Object.keys(entity)) {
        const response = await dao.getAllOnIndex(currField);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toEqual([entity]);
        expect(response.message).toContain(`${entityName}s retrieved successfully`);
      }
    }
  });

  test("Retrieval of all entities on index with unknown index is empty", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllOnIndex("unknown_index");
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual([]);
      expect(response.message).toContain(`No ${dao.entityName}s found`);
    }
  });

  // getAllMatchingOnIndex tests
  test("Successful retrieval of all entities matching index", async () => {
    await populateSecondDummyWave();

    for (const [entityName, { entity, dao }] of entityDaoMap) {
      for (const currField of Object.keys(entity)) {
        const response = await dao.getAllMatchingOnIndex(currField, entity[currField]);
        expect(response).toBeDefined();
        expect(response).toBeInstanceOf(SuccessResponse);
        expect(response.statusCode).toBe(200);
        expect(response.object).toEqual([entity, entityDaoMap2.get(entityName).entity]);
        expect(response.message).toContain(`${entityName}s retrieved successfully`);
      }
    }
  });

  test("Retrieval of all entities matching index with invalid index is empty", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllMatchingOnIndex("invalid_index", entity[dao.keyName]);
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual([]);
      expect(response.message).toContain(`No ${dao.entityName}s found`);
    }
  });

  test("Retrieval of all entities matching index with invalid value is empty", async () => {
    for (const [entityName, { entity, dao }] of entityDaoMap) {
      const response = await dao.getAllMatchingOnIndex(dao.keyName, "invalid_value");
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(SuccessResponse);
      expect(response.statusCode).toBe(200);
      expect(response.object).toEqual([]);
      expect(response.message).toContain(`No ${dao.entityName}s found`);
    }
  });

  // getAll tests

  // TODO: add a test for the transaction logic thingy
});
