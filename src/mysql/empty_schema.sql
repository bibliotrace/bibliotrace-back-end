USE bibliotrace_v3;

DROP TABLE IF EXISTS audiences, audit, audit_states, auth, books, campus, checkout, genres, genre_types, inventory, series, suggestions, tags, users, user_roles;

CREATE TABLE audiences (
  id TINYINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE audit_states (
  id TINYINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE genre_types (
  id TINYINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE series (
  id TINYINT UNSIGNED PRIMARY KEY,
  series_name VARCHAR(255) NOT NULL,
  max_count TINYINT UNSIGNED
);
CREATE INDEX idx_series_name ON series(series_name);

CREATE TABLE user_roles (
  id TINYINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE campus (
  id TINYINT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE books (
  id INT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  isbn_list VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  primary_genre_id TINYINT UNSIGNED NOT NULL,
  audience_id TINYINT UNSIGNED NOT NULL,
  pages SMALLINT,
  series_id TINYINT UNSIGNED,
  series_number TINYINT UNSIGNED,
  publish_date YEAR,
  short_description TEXT,
  language VARCHAR(31),
  img_callback VARCHAR(255),
  FOREIGN KEY (primary_genre_id) REFERENCES genre_types(id),
  FOREIGN KEY (audience_id) REFERENCES audiences(id),
  FOREIGN KEY (series_id) REFERENCES series(id)
);
CREATE UNIQUE INDEX idx_name ON books(name);

CREATE TABLE audit (
  book_id INT UNSIGNED PRIMARY KEY,
  last_audit_date DATE,
  state_id TINYINT UNSIGNED NOT NULL,
  expected_amount SMALLINT,
  actual_amount SMALLINT,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (state_id) REFERENCES audit_states(id)
);

CREATE TABLE inventory (
  qr VARCHAR(15) PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  location VARCHAR(255) NOT NULL,
  campus_id TINYINT UNSIGNED NOT NULL,
  ttl TINYINT UNSIGNED NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (campus_id) REFERENCES campus(id)
);
CREATE INDEX idx_location ON inventory(location);
CREATE INDEX idx_campus_id ON campus(id);
CREATE INDEX idx_ttl ON inventory(ttl);

CREATE TABLE checkout (
  timestamp TIMESTAMP PRIMARY KEY,
  qr VARCHAR(15) NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  state ENUM('First', 'In', 'Out') NOT NULL,
  FOREIGN KEY (qr) REFERENCES inventory(qr),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
CREATE INDEX idx_qr ON checkout(qr);
CREATE INDEX idx_book_id ON checkout(book_id);

CREATE TABLE genres (
  book_id INT UNSIGNED PRIMARY KEY,
  genre_id_1 TINYINT UNSIGNED NOT NULL,
  genre_id_2 TINYINT UNSIGNED,
  genre_id_3 TINYINT UNSIGNED,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (genre_id_1) REFERENCES genre_types(id),
  FOREIGN KEY (genre_id_2) REFERENCES genre_types(id),
  FOREIGN KEY (genre_id_3) REFERENCES genre_types(id)
);

CREATE TABLE tags (
  id SMALLINT UNSIGNED PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  tag VARCHAR(31) NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id)
);
CREATE INDEX idx_tag ON tags(tag);

CREATE TABLE suggestions (
  timestamp TIMESTAMP PRIMARY KEY,
  content TEXT NOT NULL
);

CREATE TABLE users (
  username VARCHAR(255) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  role_id TINYINT UNSIGNED NOT NULL,
  email VARCHAR(255),
  campus_id TINYINT UNSIGNED NOT NULL,
  FOREIGN KEY (role_id) REFERENCES user_roles(id),
  FOREIGN KEY (campus_id) REFERENCES campus(id)
);

CREATE TABLE auth (
  token VARCHAR(255) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  FOREIGN KEY (username) REFERENCES users(username)
);