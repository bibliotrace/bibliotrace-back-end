interface Inventory {
  qr: string;
  book_id: number;
  location_id: number;
  campus_id: number;
  is_checked_out?: number | null;
}

export type { Inventory };
