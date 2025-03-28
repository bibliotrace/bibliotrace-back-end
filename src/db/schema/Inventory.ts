interface Inventory {
  qr: string;
  book_id: number;
  location_id: number;
  campus_id: number;
  ttl?: number | null; // TODO: determine if we still need this
}

export type { Inventory };
