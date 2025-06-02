import { Audit } from "../db/schema/Audit";
import { AuditEntry } from "../db/schema/AuditEntry";
import { Book } from "../db/schema/Book";
import { Campus } from "../db/schema/Campus";
import { Inventory } from "../db/schema/Inventory";
import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";
import AuditService from "../service/AuditService";
import { parseQr } from "../utils/utils";

export default class AuditHandler {
  auditService: AuditService;

  constructor(auditService: AuditService) {
    this.auditService = auditService;
  }

  public async auditBook(
    reqBody,
    auth
  ): Promise<[Response<AuditEntry | Inventory | Book | Campus> | RequestErrorResponse<any>, Book]> {
    if (!reqBody.qr_code) {
      return [new RequestErrorResponse("Missing qr_code"), null];
    } else if (!reqBody.location_id) {
      return [new RequestErrorResponse("Missing location"), null];
    } else if (!reqBody.audit_id) {
      return [new RequestErrorResponse("Missing audit_id"), null];
    } else if (!auth?.userRole?.campus) {
      return [new RequestErrorResponse("Missing campus"), null];
    }

    const qrResponse = parseQr(reqBody.qr_code);
    if (qrResponse) return [qrResponse, null];

    return this.auditService.auditBook(
      reqBody.qr_code,
      reqBody.location_id,
      reqBody.audit_id,
      auth.userRole.campus
    );
  }

  public async startAudit(auth): Promise<Response<Audit | Campus>> {
    if (!auth?.userRole?.campus) {
      return new RequestErrorResponse("Missing campus");
    }

    return await this.auditService.startAudit(auth.userRole.campus);
  }

  public async getCurrentAudit(auth): Promise<Response<Audit | Campus>> {
    if (!auth?.userRole?.campus) {
      return new RequestErrorResponse("Missing campus");
    }

    return await this.auditService.getCurrentAudit(auth.userRole.campus);
  }

  public async completeLocation(reqBody, auth): Promise<Response<Audit | Campus>> {
    if (!reqBody.location_id) {
      return new RequestErrorResponse("Missing location");
    } else if (!reqBody.audit_id) {
      return new RequestErrorResponse("Missing audit_id");
    } else if (!auth?.userRole?.campus) {
      return new RequestErrorResponse("Missing campus");
    }

    return await this.auditService.completeLocation(reqBody.location_id, auth.userRole.campus);
  }

  public async completeAudit(
    reqBody,
    auth
  ): Promise<Response<Audit | AuditEntry | Campus | Inventory[]>> {
    if (!reqBody.audit_id) {
      return new RequestErrorResponse("Missing audit_id");
    } else if (!auth?.userRole?.campus) {
      return new RequestErrorResponse("Missing campus");
    } else if (reqBody.sync_inventory === undefined) {
      return new RequestErrorResponse("Missing sync_inventory flag");
    } 

    return await this.auditService.completeAudit(reqBody.audit_id, auth.userRole.campus, reqBody.sync_inventory);
  }
  
  public async deleteAudit(
    reqBody,
  ): Promise<Response<any>> {
    if (!reqBody.audit_id) {
      return new RequestErrorResponse("Missing audit_id");
    }

    return await this.auditService.deleteAudit(reqBody.audit_id);
  }

}
