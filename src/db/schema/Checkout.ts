interface Checkout {
  checkout_id?: number;
  timestamp?: string | null; // MySQL will generate the timestamp for us if we don't provide one
  qr: string;
  book_id: number;
  state: "First" | "In" | "Out";
}

export type { Checkout };
