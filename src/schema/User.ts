interface User {
  username: string;
  password_hash: string;
  role_id: number;
  email: string;
  campus_id: number;
}

export type { User };
