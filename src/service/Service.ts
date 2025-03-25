import AudienceDao from "../db/dao/AudienceDao";
import AuditDao from "../db/dao/AuditDao";
import AuditEntryDao from "../db/dao/AuditEntryDao";
import BookDao from "../db/dao/BookDao";
import CampusDao from "../db/dao/CampusDao";
import CheckoutDao from "../db/dao/CheckoutDao";
import DaoFactory from "../db/dao/DaoFactory";
import GenreDao from "../db/dao/GenreDao";
import InventoryDao from "../db/dao/InventoryDao";
import LocationDao from "../db/dao/LocationDao";
import RestockListDao from "../db/dao/RestockListDao";
import SeriesDao from "../db/dao/SeriesDao";
import ShoppingListDao from "../db/dao/ShoppingListDao";
import SuggestionDao from "../db/dao/SuggestionDao";
import TagDao from "../db/dao/TagDao";
import UserDao from "../db/dao/UserDao";
import UserRoleDao from "../db/dao/UserRoleDao";

abstract class Service {
  protected readonly audienceDao: AudienceDao;
  protected readonly auditDao: AuditDao;
  protected readonly auditEntryDao: AuditEntryDao;
  protected readonly bookDao: BookDao;
  protected readonly campusDao: CampusDao;
  protected readonly checkoutDao: CheckoutDao;
  protected readonly genreDao: GenreDao;
  protected readonly inventoryDao: InventoryDao;
  protected readonly locationDao: LocationDao;
  protected readonly restockListDao: RestockListDao;
  protected readonly seriesDao: SeriesDao;
  protected readonly shoppingListDao: ShoppingListDao;
  protected readonly suggestionDao: SuggestionDao;
  protected readonly tagDao: TagDao;
  protected readonly userDao: UserDao;
  protected readonly userRoleDao: UserRoleDao;

  constructor(daoFactory: DaoFactory) {
    this.audienceDao = daoFactory.getAudienceDao();
    this.auditDao = daoFactory.getAuditDao();
    this.auditEntryDao = daoFactory.getAuditEntryDao();
    this.bookDao = daoFactory.getBookDao();
    this.campusDao = daoFactory.getCampusDao();
    this.checkoutDao = daoFactory.getCheckoutDao();
    this.genreDao = daoFactory.getGenreDao();
    this.inventoryDao = daoFactory.getInventoryDao();
    this.locationDao = daoFactory.getLocationDao();
    this.restockListDao = daoFactory.getRestockListDao();
    this.seriesDao = daoFactory.getSeriesDao();
    this.shoppingListDao = daoFactory.getShoppingListDao();
    this.suggestionDao = daoFactory.getSuggestionDao();
    this.tagDao = daoFactory.getTagDao();
    this.userDao = daoFactory.getUserDao();
    this.userRoleDao = daoFactory.getUserRoleDao();
  }
}

export default Service;
