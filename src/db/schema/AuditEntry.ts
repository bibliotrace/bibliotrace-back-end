interface AuditEntry {
  id?: number;
  qr: string;
  audit_id: number;
  state?: string;
}

export type { AuditEntry };
