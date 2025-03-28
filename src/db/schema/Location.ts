interface Location {
  id?: number;
  campus_id: number;
  location_name: string;
  in_audit?: number | null;
}

export type { Location };
