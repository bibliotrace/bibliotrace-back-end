import DaoFactory from "../db/dao/DaoFactory";
import { Audit } from "../db/schema/Audit";
import { AuditEntry, State } from "../db/schema/AuditEntry";
import { Book } from "../db/schema/Book";
import { Campus } from "../db/schema/Campus";
import { Inventory } from "../db/schema/Inventory";
import { Location } from "../db/schema/Location";
import RequestErrorResponse from "../response/RequestErrorResponse";
import SuccessResponse from "../response/SuccessResponse";
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
    } else if (!inventoryResponse.object) {
      return [new ServerErrorResponse("Book does not exist in inventory"), null];
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
      state = State.FOUND;
    } else {
      state = State.MISPLACED;
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

    if (inventoryResponse.object.is_checked_out == 1) {
      await this.inventoryDao.updateCheckoutState(qr_code, campusResponse.object.id, false);
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

    //mark all locations as in_audit
    const locationResponse = await this.locationDao.setInAuditForCampus(campus_response.object.id);
    if (locationResponse.statusCode !== 200) {
      return locationResponse;
    }

    //create a new audit
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

  public async completeLocation(
    location_id: number,
    campus_name: string
  ): Promise<Response<Location | Campus>> {
    const campus_response = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campus_response.statusCode !== 200) {
      return campus_response;
    } else if (!campus_response.object) {
      return new RequestErrorResponse(`Campus with name: ${campus_name} not found`);
    }

    return await this.locationDao.update(location_id, { in_audit: 0 });
  }

  public async completeAudit(
    audit_id: number,
    campus_name: string,
    sync_inventory: boolean,
  ): Promise<Response<Audit | AuditEntry | Campus | Inventory[]>> {
    const campusResponse = await this.campusDao.getByKeyAndValue("campus_name", campus_name);
    if (campusResponse.statusCode !== 200) {
      return campusResponse;
    } else if (!campusResponse.object) {
      return new RequestErrorResponse(`Could not find campus with name: ${campus_name}`);
    }

    const inventoryGetResponse = await this.inventoryDao.getMissingInventoryForAudit(
      audit_id,
      campusResponse.object.id
    );
    if (inventoryGetResponse.statusCode !== 200) {
      return inventoryGetResponse;
    }

    for (const inventory of inventoryGetResponse.object) {
      const auditEntryObj: AuditEntry = {
        audit_id: audit_id,
        qr: inventory.qr,
        state: State.MISSING,
      };

      const auditEntryResponse = await this.auditEntryDao.create(auditEntryObj);
      if (auditEntryResponse.statusCode !== 200) {
        return auditEntryResponse;
      }

      const inventoryUpdateResponse = await this.inventoryDao.setIsCheckedOut(inventory.qr, 1);
      if (inventoryUpdateResponse.statusCode !== 200) {
        return inventoryUpdateResponse;
      }
    }

    return this.auditDao.update(audit_id, { completed_date: new Date() });
  }

  public async deleteAudit(
    audit_id: number,
  ): Promise<Response<any>> {

    const auditGetResponse = await this.auditDao.getByKeyAndValue("id", audit_id.toString());
    if (auditGetResponse.statusCode !== 200) {
      return auditGetResponse;
    } else if (!auditGetResponse.object) {
      return new RequestErrorResponse(`Audit with id: ${audit_id} not found`);
    }

    const auditEntryDeleteResponse = await this.auditEntryDao.deleteOnIndexByValue("audit_id", audit_id.toString());
    if (auditEntryDeleteResponse.statusCode !== 200) {
      return auditGetResponse;
    }

    const auditDeleteResponse = await this.auditDao.delete(audit_id);
    if (auditDeleteResponse.statusCode !== 200) {
      return auditDeleteResponse;
    }

    return new SuccessResponse(`Audit with id: ${audit_id} deleted successfully`);
  }

}
