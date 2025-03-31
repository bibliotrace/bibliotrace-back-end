import { Kysely } from "kysely";
import Database from "../schema/Database";
import AudienceDao from "./AudienceDao";
import AuditDao from "./AuditDao";
import AuditEntryDao from "./AuditEntryDao";
import BookDao from "./BookDao";
import CampusDao from "./CampusDao";
import CheckoutDao from "./CheckoutDao";
import GenreDao from "./GenreDao";
import InventoryDao from "./InventoryDao";
import SeriesDao from "./SeriesDao";
import SuggestionDao from "./SuggestionDao";
import TagDao from "./TagDao";
import UserDao from "./UserDao";
import UserRoleDao from "./UserRoleDao";
import LocationDao from "./LocationDao";
import RestockListDao from "./RestockListDao";
import ShoppingListDao from "./ShoppingListDao";
import BookGenreDao from "./BookGenreDao";
import BookTagDao from "./BookTagDao";

class DaoFactory {
  audienceDao: AudienceDao;
  auditDao: AuditDao;
  auditEntryDao: AuditEntryDao;
  bookDao: BookDao;
  bookGenreDao: BookGenreDao;
  bookTagDao: BookTagDao;
  campusDao: CampusDao;
  checkoutDao: CheckoutDao;
  genreDao: GenreDao;
  inventoryDao: InventoryDao;
  locationDao: LocationDao;
  restockListDao: RestockListDao;
  seriesDao: SeriesDao;
  shoppingListDao: ShoppingListDao;
  suggestionDao: SuggestionDao;
  tagDao: TagDao;
  userDao: UserDao;
  userRoleDao: UserRoleDao;

  constructor(db: Kysely<Database>) {
    this.audienceDao = new AudienceDao(db);
    this.auditDao = new AuditDao(db);
    this.auditEntryDao = new AuditEntryDao(db);
    this.bookDao = new BookDao(db);
    this.bookGenreDao = new BookGenreDao(db);
    this.bookTagDao = new BookTagDao(db);
    this.campusDao = new CampusDao(db);
    this.checkoutDao = new CheckoutDao(db);
    this.genreDao = new GenreDao(db);
    this.inventoryDao = new InventoryDao(db);
    this.locationDao = new LocationDao(db);
    this.restockListDao = new RestockListDao(db);
    this.seriesDao = new SeriesDao(db);
    this.shoppingListDao = new ShoppingListDao(db);
    this.suggestionDao = new SuggestionDao(db);
    this.tagDao = new TagDao(db);
    this.userDao = new UserDao(db);
    this.userRoleDao = new UserRoleDao(db);
  }

  getAudienceDao(): AudienceDao {
    return this.audienceDao;
  }

  getAuditDao(): AuditDao {
    return this.auditDao;
  }

  getAuditEntryDao(): AuditEntryDao {
    return this.auditEntryDao;
  }

  getBookDao(): BookDao {
    return this.bookDao;
  }

  getBookGenreDao(): BookGenreDao {
    return this.bookGenreDao;
  }

  getBookTagDao(): BookTagDao {
    return this.bookTagDao;
  }

  getCampusDao(): CampusDao {
    return this.campusDao;
  }

  getCheckoutDao(): CheckoutDao {
    return this.checkoutDao;
  }

  getGenreDao(): GenreDao {
    return this.genreDao;
  }

  getInventoryDao(): InventoryDao {
    return this.inventoryDao;
  }

  getLocationDao(): LocationDao {
    return this.locationDao;
  }

  getRestockListDao(): RestockListDao {
    return this.restockListDao;
  }

  getSeriesDao(): SeriesDao {
    return this.seriesDao;
  }

  getShoppingListDao(): ShoppingListDao {
    return this.shoppingListDao;
  }

  getSuggestionDao(): SuggestionDao {
    return this.suggestionDao;
  }

  getTagDao(): TagDao {
    return this.tagDao;
  }

  getUserDao(): UserDao {
    return this.userDao;
  }

  getUserRoleDao(): UserRoleDao {
    return this.userRoleDao;
  }
}

export default DaoFactory;
