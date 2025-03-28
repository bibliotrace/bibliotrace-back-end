import DaoFactory from "../db/dao/DaoFactory";
import { AuditEntry, State } from "../db/schema/AuditEntry";
import Service from "./Service";

export default class AuditService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async auditBook(
    qr_code: string,
    location_id: number,
    audit_id: number,
    campus_id: number
  ) {
    let state = null;

    //get inventory
    const inventoryResponse = await this.inventoryDao.getInventoryByCampusAndQr(qr_code, campus_id);
    if (inventoryResponse.statusCode !== 200) {
      return inventoryResponse;
    }

    //create audit entry if extra qr
    if (!inventoryResponse.object) {
      const auditEntryObj: AuditEntry = {
        audit_id: audit_id,
        qr: qr_code,
        state: State.Extra,
      };
      this.auditEntryDao.create(auditEntryObj);
    }

    //get book details
    const bookResponse = await this.bookDao.getByKeyAndValue(
      "id",
      inventoryResponse.object.book_id.toString()
    );
    if (bookResponse.statusCode !== 200) {
      return bookResponse;
    }

    if (inventoryResponse.object.location_id === location_id) {
      state = State.Found;
    } else {
      state = State.Misplaced;

      //update inventory location if misplaced
      inventoryResponse.object.location_id = location_id;
      const inventoryUpdateResponse = await this.inventoryDao.update(
        qr_code,
        inventoryResponse.object
      );
      if (inventoryUpdateResponse.statusCode !== 200) {
        return inventoryUpdateResponse;
      }
    }

    //create audit entry for found/misplaced
    const auditEntryObj: AuditEntry = {
      audit_id: audit_id,
      qr: qr_code,
      state: state,
    };

    return await this.auditEntryDao.create(auditEntryObj);
  }
}
