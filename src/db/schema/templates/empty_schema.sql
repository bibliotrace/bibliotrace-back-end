USE bibliotrace_v3;

DROP TABLE IF EXISTS book_genre, book_tag, shopping_list, restock_list, location, audiences, audit, audit_states, books, campus, checkout, genre, tag, inventory, series, suggestions, users, user_roles;

CREATE TABLE audiences (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  audience_name VARCHAR(255) NOT NULL
);

CREATE TABLE audit_states (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  audit_state_name VARCHAR(255) NOT NULL
);

CREATE TABLE series (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  series_name VARCHAR(255) NOT NULL,
  max_count TINYINT UNSIGNED
);
CREATE INDEX idx_series_name ON series(series_name);

CREATE TABLE user_roles (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  role_name VARCHAR(255) NOT NULL
);

CREATE TABLE campus (
  id TINYINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  campus_name VARCHAR(255) NOT NULL
);

CREATE TABLE location (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  campus_id TINYINT UNSIGNED NOT NULL,
  location_name VARCHAR(255) NOT NULL,
  FOREIGN KEY (campus_id) REFERENCES campus(id)
);

CREATE TABLE books (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  book_title VARCHAR(255) NOT NULL,
  isbn_list VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  primary_genre_id INT UNSIGNED NOT NULL,
  audience_id TINYINT UNSIGNED NOT NULL,
  pages SMALLINT,
  series_id TINYINT UNSIGNED,
  series_number TINYINT UNSIGNED,
  publish_date YEAR,
  short_description TEXT,
  language VARCHAR(31),
  img_callback VARCHAR(255),
  FOREIGN KEY (primary_genre_id) REFERENCES genre(id),
  FOREIGN KEY (audience_id) REFERENCES audiences(id),
  FOREIGN KEY (series_id) REFERENCES series(id)
);
CREATE UNIQUE INDEX idx_name ON books(book_title);

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
  location_id INT UNSIGNED NOT NULL,
  campus_id TINYINT UNSIGNED NOT NULL,
  ttl INT UNSIGNED NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (campus_id) REFERENCES campus(id),
  FOREIGN KEY (location_id) REFERENCES location(id)
);
CREATE INDEX idx_location ON inventory(location_id);
CREATE INDEX idx_campus_id ON campus(id);
CREATE INDEX idx_ttl ON inventory(ttl);

CREATE TABLE checkout (
  timestamp TIMESTAMP PRIMARY KEY,
  qr VARCHAR(15) NOT NULL,
  book_id INT UNSIGNED NOT NULL,
  state ENUM('First', 'In', 'Out') NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id)
);
CREATE INDEX idx_qr ON checkout(qr);
CREATE INDEX idx_book_id ON checkout(book_id);

CREATE TABLE genre (
  id INT UNSIGNED PRIMARY KEY AUTOINCREMENT,
  genre_name VARCHAR(255) NOT NULL,
  campus_id TINYINT UNSIGNED,
  FOREIGN KEY (campus_id) REFERENCES campus(id)
);

CREATE TABLE tag (
  id INT UNSIGNED PRIMARY KEY AUTOINCREMENT,
  tag_name VARCHAR(255) NOT NULL,
  campus_id TINYINT UNSIGNED,
  FOREIGN KEY (campus_id) REFERENCES campus(id)
);

CREATE TABLE book_genre (
  id INT UNSIGNED PRIMARY KEY AUTOINCREMENT,
  book_id INT UNSIGNED NOT NULL,
  genre_id INT UNSIGNED NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (genre_id) REFERENCES genre(id)
);

CREATE TABLE book_tag (
  id INT UNSIGNED PRIMARY KEY AUTOINCREMENT,
  book_id INT UNSIGNED NOT NULL,
  tag_id INT UNSIGNED NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (tag_id) REFERENCES tag(id)
);

CREATE TABLE suggestions (
  timestamp TIMESTAMP PRIMARY KEY,
  content TEXT NOT NULL,
  campus_id TINYINT UNSIGNED NOT NULL,
  FOREIGN KEY (campus_id) REFERENCES campus(id)
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

CREATE TABLE shopping_list (
  book_id INT UNSIGNED PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  campus_id TINYINT UNSIGNED NOT NULL,
  FOREIGN KEY (campus_id) REFERENCES campus(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE restock_list (
  book_id INT UNSIGNED PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  campus_id TINYINT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  FOREIGN KEY (campus_id) REFERENCES campus(id),
  FOREIGN KEY (book_id) REFERENCES books(id)
);