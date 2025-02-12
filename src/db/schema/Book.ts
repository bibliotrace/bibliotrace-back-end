interface Book {
  id?: number;
  name: string;
  isbn_list?: string | null;
  author: string;
  primary_genre_id: number;
  audience_id: number;
  pages?: number | null;
  series_id?: number | null;
  series_number?: number | null;
  publish_date?: number | null; // YYYY
  short_description?: string | null;
  language?: string | null;
  img_callback?: string | null;
}

export type { Book };
