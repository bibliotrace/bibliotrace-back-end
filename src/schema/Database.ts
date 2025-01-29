import type { Book } from "./Book";
import type { Audit } from "./Audit";
import type { Inventory } from "./Inventory";
import type { Checkout } from "./Checkout";
import type { Genres } from "./Genres";
import type { Series } from "./Series";
import type { Tag } from "./Tag";

interface Database {
  books: Book;
  audit: Audit;
  inventory: Inventory;
  checkout: Checkout;
  genres: Genres;
  series: Series;
  tags: Tag;
}

export default Database;
