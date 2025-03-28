export enum State {
  "Missing",
  "Misplaced",
  "Found",
  "Extra",
}

interface AuditEntry {
  id?: number;
  qr: string;
  audit_id: number;
  state?: State;
}

export type { AuditEntry };
