import RequestErrorResponse from "../response/RequestErrorResponse";
import AuditService from "../service/AuditService";
import { parseQr } from "../utils/utils";

export default class AuditHandler {
  auditService: AuditService;

  constructor(auditService: AuditService) {
    this.auditService = auditService;
  }
  public async auditBook(reqBody, auth) {
    if (!reqBody.qr_code) {
      return new RequestErrorResponse("Missing qr_code");
    } else if (!reqBody.location_id) {
      return new RequestErrorResponse("Missing location");
    } else if (!reqBody.audit_id) {
      return new RequestErrorResponse("Missing audit_id");
    } else if (!auth?.userRole?.campus) {
      return new RequestErrorResponse("Missing campus");
    }

    //TODO: check if this returns
    parseQr(reqBody.qr_code);

    return this.auditService.auditBook(
      reqBody.qr_code,
      reqBody.location_id,
      reqBody.audit_id,
      auth.userRole.campus
    );
  }
}
