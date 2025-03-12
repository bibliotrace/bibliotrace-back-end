import { Audience } from "./Audience";
import { Audit } from "./Audit";
import { AuditState } from "./AuditState";
import { Book } from "./Book";
import { Book_Genre } from "./Book_Genre";
import { Book_Tag } from "./Book_Tag";
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
  audit_states: AuditState;
  books: Book;
  book_genre: Book_Genre;
  book_tag: Book_Tag;
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
