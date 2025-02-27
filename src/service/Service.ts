import AudienceDao from "../db/dao/AudienceDao";
import AuditDao from "../db/dao/AuditDao";
import AuditStateDao from "../db/dao/AuditStateDao";
import BookDao from "../db/dao/BookDao";
import CampusDao from "../db/dao/CampusDao";
import CheckoutDao from "../db/dao/CheckoutDao";
import DaoFactory from "../db/dao/DaoFactory";
import GenresDao from "../db/dao/GenresDao";
import GenreTypeDao from "../db/dao/GenreTypeDao";
import InventoryDao from "../db/dao/InventoryDao";
import LocationDao from "../db/dao/LocationDao";
import SeriesDao from "../db/dao/SeriesDao";
import SuggestionDao from "../db/dao/SuggestionDao";
import TagDao from "../db/dao/TagDao";
import UserDao from "../db/dao/UserDao";
import UserRoleDao from "../db/dao/UserRoleDao";

abstract class Service {
  protected readonly audienceDao: AudienceDao;
  protected readonly auditDao: AuditDao;
  protected readonly auditStateDao: AuditStateDao;
  protected readonly bookDao: BookDao;
  protected readonly campusDao: CampusDao;
  protected readonly checkoutDao: CheckoutDao;
  protected readonly genresDao: GenresDao;
  protected readonly genreTypeDao: GenreTypeDao;
  protected readonly inventoryDao: InventoryDao;
  protected readonly locationDao: LocationDao;
  protected readonly seriesDao: SeriesDao;
  protected readonly suggestionDao: SuggestionDao;
  protected readonly tagDao: TagDao;
  protected readonly userDao: UserDao;
  protected readonly userRoleDao: UserRoleDao;

  constructor(daoFactory: DaoFactory) {
    this.audienceDao = daoFactory.getAudienceDao();
    this.auditDao = daoFactory.getAuditDao();
    this.auditStateDao = daoFactory.getAuditStateDao();
    this.bookDao = daoFactory.getBookDao();
    this.campusDao = daoFactory.getCampusDao();
    this.checkoutDao = daoFactory.getCheckoutDao();
    this.genresDao = daoFactory.getGenresDao();
    this.genreTypeDao = daoFactory.getGenreTypeDao();
    this.inventoryDao = daoFactory.getInventoryDao();
    this.locationDao = daoFactory.getLocationDao();
    this.seriesDao = daoFactory.getSeriesDao();
    this.suggestionDao = daoFactory.getSuggestionDao();
    this.tagDao = daoFactory.getTagDao();
    this.userDao = daoFactory.getUserDao();
    this.userRoleDao = daoFactory.getUserRoleDao();
  }
}

export default Service;
