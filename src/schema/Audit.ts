interface Audit {
  book_id: number;
  last_audit_date: string; // YYYY-MM-DD
  state: "In Progress" | "Complete" | "Extra" | "Missing";
  expected_amount: number | null;
  actual_amount: number | null;
}

export type { Audit };
