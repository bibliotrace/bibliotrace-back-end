INSERT INTO genre_types (name)
VALUES ('Fiction'), ('Fantasy'), ('Thriller'), ('Mystery');

INSERT INTO campus (name)
VALUES ('Lehi'), ('Salt Lake City');

INSERT INTO user_roles (name)
VALUES ('Admin'), ('User');

INSERT INTO users (username, password_hash, role_id, email, campus_id)
VALUES ('test', '$argon2id$v=19$m=65536,t=3,p=2$zNxBnZCVc7lpGE3LJTAOGA$0TS+loWwHEtQDkJA4M3q7DXoFUWnKCZQNAWZ8CF2SSE', 1, 'testing@byu.edu', 1);

INSERT INTO audiences (name) 
VALUES ('Board Books (0-2 Years)'), ('Picture Books (2-8 Years)'), ('Early Chapter Books (6-9 Years)'), ('Middle Grade (8-12 Years)'), ('Late Teen (12-18 Years)'), ('Young Adult (18-24 Years)')

