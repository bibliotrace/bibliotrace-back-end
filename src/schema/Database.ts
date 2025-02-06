import { Audience } from "./Audience";
import { Audit } from "./Audit";
import { AuditState } from "./AuditState";
import { AuthToken } from "./AuthToken";
import { Book } from "./Book";
import { Campus } from "./Campus";
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
  auth: AuthToken;
  books: Book;
  campus: Campus;
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
