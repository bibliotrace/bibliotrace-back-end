import DaoFactory from "../db/dao/DaoFactory";
import Service from "./Service";

export default class AuditService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }
}
