interface Database {
  books: {
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
  };

  audit: {
    book_id: number;
    last_audit_date: string; // Date format 'YYYY-MM-DD'
    state: "In Progress" | "Complete" | "Extra" | "Missing";
    expected_amount: number | null;
    actual_amount: number | null;
  };

  inventory: {
    qr: string;
    book_id: number;
    location: string | null;
    campus: string | null;
  };

  checkout: {
    timestamp: string; // Timestamp format 'YYYY-MM-DD HH:MM:SS'
    qr: string;
    first_checkin: string | null; // DATETIME format
    checkin: string | null; // DATETIME format
    checkout: string | null; // DATETIME format
  };

  genres: {
    book_id: number;
    genre_1:
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
    genre_2:
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
      | "Sports"
      | null;
    genre_3:
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
      | "Sports"
      | null;
  };

  series: {
    series_id: number;
    series_name: string;
    max_count: number | null;
  };

  tags: {
    id: number;
    book_id: number;
    tag: string;
  };
}

export default Database;
