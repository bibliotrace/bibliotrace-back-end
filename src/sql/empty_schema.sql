USE bibliotrace_v3;

DROP TABLE IF EXISTS books, audit, inventory, checkout, genres, series, tags;

CREATE TABLE books (
  id INT UNSIGNED PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  isbn_list VARCHAR(255),
  author VARCHAR(255),
  primary_genre ENUM('Advanced', 'Animal', 'Fantasy', 'Graphic Novel', 'Historical Fiction', 'Humor', 'Mystery/Thriller', 'Nonfiction', 'Romance', 'Scary Stories', 'Sports') NOT NULL,
  audience ENUM('Board', 'Picture', 'Early Chapter', 'Middle Grade', 'Young Adult', 'Advanced') NOT NULL,
  pages SMALLINT,
  series VARCHAR(255),
  series_number TINYINT,
  publish_date YEAR,
  short_description TEXT,
  language VARCHAR(31),
  img_callback VARCHAR(255)
);
CREATE UNIQUE INDEX idx_name ON books(name);

CREATE TABLE audit (
  book_id INT UNSIGNED PRIMARY KEY,
  last_audit_date DATE,
  state ENUM('In Progress', 'Complete', 'Extra', 'Missing'),
  expected_amount SMALLINT,
  actual_amount SMALLINT,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE inventory (
  qr VARCHAR(15) PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  location VARCHAR(255),
  campus VARCHAR(255),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
CREATE INDEX idx_location ON inventory(location);
CREATE INDEX idx_campus ON inventory(campus);

CREATE TABLE checkout (
  timestamp TIMESTAMP PRIMARY KEY,
  qr VARCHAR(15) NOT NULL,
  first_checkin DATETIME,
  checkin DATETIME,
  checkout DATETIME,
  FOREIGN KEY (qr) REFERENCES inventory(qr)
);

CREATE TABLE genres (
  book_id INT UNSIGNED PRIMARY KEY,
  genre_1 ENUM('Advanced', 'Animal', 'Fantasy', 'Graphic Novel', 'Historical Fiction', 'Humor', 'Mystery/Thriller', 'Nonfiction', 'Romance', 'Scary Stories', 'Sports') NOT NULL,
  genre_2 ENUM('Advanced', 'Animal', 'Fantasy', 'Graphic Novel', 'Historical Fiction', 'Humor', 'Mystery/Thriller', 'Nonfiction', 'Romance', 'Scary Stories', 'Sports'),
  genre_3 ENUM('Advanced', 'Animal', 'Fantasy', 'Graphic Novel', 'Historical Fiction', 'Humor', 'Mystery/Thriller', 'Nonfiction', 'Romance', 'Scary Stories', 'Sports'),
  FOREIGN KEY (book_id) REFERENCES books(id)
);

CREATE TABLE series (
  series_id INT UNSIGNED PRIMARY KEY,
  series_name VARCHAR(255),
  max_count SMALLINT
);
CREATE INDEX idx_series_name ON series(series_name);

CREATE TABLE tags (
  id INT UNSIGNED PRIMARY KEY,
  book_id INT UNSIGNED NOT NULL,
  tag VARCHAR(31),
  FOREIGN KEY (book_id) REFERENCES books(id)
);
CREATE INDEX idx_tag ON tags(tag);