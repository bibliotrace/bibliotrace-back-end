interface Checkout {
  timestamp: string; // YYYY-MM-DD HH:MM:SS
  qr: string;
  book_id: number;
  state: "First, In, Out";
}

export type { Checkout };
