interface Checkout {
  timestamp: string; // YYYY-MM-DD HH:MM:SS
  qr: string;
  first_checkin: boolean; // only true if first checkin
  checkin: string | null; // YYYY-MM-DD HH:MM:SS
  checkout: string | null; // YYYY-MM-DD HH:MM:SS
}

export type { Checkout };
