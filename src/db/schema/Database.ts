import { Audience } from "./Audience";
import { Audit } from "./Audit";
import { AuditEntry } from "./AuditEntry";
import { Book } from "./Book";
import { BookGenre } from "./BookGenre";
import { BookTag } from "./BookTag";
import { Campus } from "./Campus";
import { Checkout } from "./Checkout";
import { Genre } from "./Genre";
import { Inventory } from "./Inventory";
import { Location } from "./Location";
import { RestockList } from "./RestockList";
import { Series } from "./Series";
import { ShoppingList } from "./ShoppingList";
import { Suggestion } from "./Suggestion";
import { Tag } from "./Tag";
import { User } from "./User";
import { UserRole } from "./UserRole";

interface Database {
  audiences: Audience;
  audit: Audit;
  audit_entry: AuditEntry;
  books: Book;
  book_genre: BookGenre;
  book_tag: BookTag;
  campus: Campus;
  checkout: Checkout;
  genre: Genre;
  inventory: Inventory;
  location: Location;
  series: Series;
  suggestions: Suggestion;
  tag: Tag;
  users: User;
  user_roles: UserRole;
  shopping_list: ShoppingList;
  restock_list: RestockList;
}

export default Database;
