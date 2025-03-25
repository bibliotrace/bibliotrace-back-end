import { Audience } from "./Audience";
import { Audit } from "./Audit";
import { AuditEntry } from "./AuditEntry";
import { Book } from "./Book";
import { Campus } from "./Campus";
import { Checkout } from "./Checkout";
import { Genres } from "./Genres";
import { GenreType } from "./GenreType";
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
  campus: Campus;
  checkout: Checkout;
  genres: Genres;
  genre_types: GenreType;
  inventory: Inventory;
  location: Location;
  series: Series;
  suggestions: Suggestion;
  tags: Tag;
  users: User;
  user_roles: UserRole;
  shopping_list: ShoppingList;
  restock_list: RestockList;
}

export default Database;
