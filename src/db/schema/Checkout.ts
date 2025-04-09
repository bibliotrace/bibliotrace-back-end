interface Checkout {
  checkout_id?: number;
  timestamp?: string | null; // MySQL will generate the timestamp for us if we don't provide one
  qr: string;
  campus_id: number;
  book_id: number;
}

export type { Checkout };
