interface Audit {
  id?: number | null;
  campus_id: number;
  start_date?: Date | null;
  completed_date?: Date | null;
}

export type { Audit };
