export const enum State {
  MISSING = "Missing",
  MISPLACED = "Misplaced",
  FOUND = "Found",
  EXTRA = "Extra",
}

interface AuditEntry {
  id?: number;
  qr: string;
  audit_id: number;
  state?: State | null;
}

export type { AuditEntry };
