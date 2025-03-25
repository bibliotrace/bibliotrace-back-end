interface Audit {
  id?: number | null;
  campus_id: number;
  start_date?: Date | null;
  complete_date?: Date | null;
}

export type { Audit };
