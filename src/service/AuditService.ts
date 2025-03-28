import DaoFactory from "../db/dao/DaoFactory";
import { Audit } from "../db/schema/Audit";
import { AuditEntry, State } from "../db/schema/AuditEntry";
import { Book } from "../db/schema/Book";
import { Campus } from "../db/schema/Campus";
import { Inventory } from "../db/schema/Inventory";
import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import ServerErrorResponse from "../response/ServerErrorResponse";
import Service from "./Service";

export default class AuditService extends Service {
  constructor(daoFactory: DaoFactory) {
    super(daoFactory);
  }

  public async auditBook(
    qr_code: string,
    location_id: number,
    audit_id: number,
    campus_name: string
  ): Promise<[Response<AuditEntry | Inventory | Book | Campus>, Book]> {
    let state = null;
    //get inventory
    const campusResponse = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campusResponse.statusCode !== 200) {
      return [campusResponse, null];
    } else if (!campusResponse.object) {
      return [new ServerErrorResponse(`No campus with name: ${campus_name} found`), null];
    }

    const inventoryResponse = await this.inventoryDao.getInventoryByCampusAndQr(
      qr_code,
      campusResponse.object.id
    );
    if (inventoryResponse.statusCode !== 200) {
      return [inventoryResponse, null];
    }

    //create audit entry if extra qr. Need to ask if this should be included in report
    if (!inventoryResponse.object) {
      return [new ServerErrorResponse("Book does not exist in inventory"), null];
      // const auditEntryObj: AuditEntry = {
      //   audit_id: audit_id,
      //   qr: qr_code,
      //   state: State.Extra,
      // };
      // return await this.auditEntryDao.create(auditEntryObj);
    }

    //get book details
    const bookResponse = await this.bookDao.getByKeyAndValue(
      "id",
      inventoryResponse.object.book_id.toString()
    );
    if (bookResponse.statusCode !== 200) {
      return [bookResponse, null];
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
        return [inventoryUpdateResponse, null];
      }
    }

    //create audit entry for found/misplaced
    const auditEntryObj: AuditEntry = {
      audit_id: audit_id,
      qr: qr_code,
      state: state,
    };

    return [await this.auditEntryDao.create(auditEntryObj), bookResponse.object];
  }

  public async startAudit(campus_name: string): Promise<Response<Audit | Campus>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object) {
      return new RequestErrorResponse(`Campus with name: ${campus_name} not found`);
    }

    const auditObj: Audit = {
      campus_id: campus_response.object.id,
    };
    return await this.auditDao.create(auditObj);
  }

  public async getCurrentAudit(campus_name: string): Promise<Response<Audit | Campus>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object) {
      return new RequestErrorResponse(`Campus with name: ${campus_name} not found`);
    }

    return await this.auditDao.getCurrentAuditForCampus(campus_response.object.id);
  }
}
