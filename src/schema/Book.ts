interface Book {
  id: number;
  name: string;
  isbn_list: string | null;
  author: string | null;
  primary_genre:
    | "Advanced"
    | "Animal"
    | "Fantasy"
    | "Graphic Novel"
    | "Historical Fiction"
    | "Humor"
    | "Mystery/Thriller"
    | "Nonfiction"
    | "Romance"
    | "Scary Stories"
    | "Sports";
  audience:
    | "Board"
    | "Picture"
    | "Early Chapter"
    | "Middle Grade"
    | "Young Adult"
    | "Advanced";
  pages: number | null;
  series: string | null;
  series_number: number | null;
  publish_date: number | null; // Year
  short_description: string | null;
  language: string | null;
  img_callback: string | null;
}

export type { Book };
