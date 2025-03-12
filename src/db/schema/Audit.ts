interface Audit {
  book_id: number; // this should probably be keyed on QR instead of book id
  last_audit_date?: string | null; // MySQL will generate the date for us if we don't provide one
  state_id: number;
  expected_amount?: number | null;
  actual_amount?: number | null;
}

export type { Audit };
