interface Audit {
  book_id: number;
  last_audit_date: string | null; // YYYY-MM-DD
  state_id: number;
  expected_amount: number | null;
  actual_amount: number | null;
}

export type { Audit };
