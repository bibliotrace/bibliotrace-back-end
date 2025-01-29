import { Audience } from "./Audience";
import { Audit } from "./Audit";
import { AuditState } from "./AuditState";
import { Book } from "./Book";
import { Checkout } from "./Checkout";
import { Genres } from "./Genres";
import { GenreType } from "./GenreType";
import { Inventory } from "./Inventory";
import { Series } from "./Series";
import { Suggestion } from "./Suggestion";
import { Tag } from "./Tag";
import { User } from "./User";
import { UserRole } from "./UserRole";

interface Database {
  audiences: Audience;
  audit: Audit;
  audit_states: AuditState;
  books: Book;
  checkout: Checkout;
  genres: Genres;
  genre_types: GenreType;
  inventory: Inventory;
  series: Series;
  suggestions: Suggestion;
  tags: Tag;
  users: User;
  user_roles: UserRole;
}

export default Database;
