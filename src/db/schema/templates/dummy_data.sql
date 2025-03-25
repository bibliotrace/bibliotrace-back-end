USE bibliotrace_v3;

-- Modify data as needed for tests, this will be run at initialization of bibliotrace service

INSERT INTO campus (campus_name)
VALUES ('Lehi'), ('Salt Lake City');

INSERT INTO user_roles (role_name)
VALUES ('Admin'), ('User');

INSERT INTO users (username, password_hash, role_id, email, campus_id)
VALUES ('test', '$argon2id$v=19$m=65536,t=3,p=2$zNxBnZCVc7lpGE3LJTAOGA$0TS+loWwHEtQDkJA4M3q7DXoFUWnKCZQNAWZ8CF2SSE', 1, 'testing@byu.edu', 1),
('user', '$argon2id$v=19$m=65536,t=3,p=2$dyl9H5msFDyFLs8kUbzbQw$a55al+wfe6Da1BSN6KwwhCKy578DufkWNKGG5gAhQ2Q', 2, 'testingUser@byu.edu', 2),
('plebian', '$argon2id$v=19$m=65536,t=3,p=2$CgfQIb8btzWq1knZnDMi8Q$yWRLTEl8fPCt7cjNITV7nNe6GbAVXJ7I0AyRr8EOcVc', 2, 'plebian@byu.edu', 1);
-- Username and password are the same thing for the users in this insert statement

INSERT INTO audiences (audience_name) 
VALUES ('Board Books (0-2 Years)'), ('Picture Books (2-8 Years)'), ('Early Chapter Books (6-9 Years)'), ('Middle Grade (8-12 Years)'), ('Young Adult (12-18 Years)'), ('Advanced (16+ Years)');

INSERT INTO genre (genre_name) VALUES
('Action-Adventure/Suspense'), ('Activity Book'), ('Board Book'), ('Dystopian'), ('Fantasy'), ('Fiction'), ('Graphic Novel'), 
('Historical Fiction'), ('Leveled Reader'), ('Non-Fiction'), ('Paranormal'), ('Picture Book'), ('Romance'), ('Science Fiction'), 
('Spanish'), ('Young Chapter Book');

-- Insert data into the 'tag' table
INSERT INTO tag (tag_name) VALUES
('Adventure'),
('Mythology'),
('Dystopia');

INSERT INTO books (book_title, isbn_list, author, primary_genre_id, audience_id, pages, publish_date, short_description, language, img_callback)
VALUES 
('Harry Potter and the Sorcerer''s Stone', '9780439708180|9780439362139', 'J.K. Rowling', 5, 4, 309, 1997, 'The first book in the Harry Potter series, following the young wizard''s discovery of his magical heritage.', 'English', NULL),
('Harry Potter and the Chamber of Secrets', '9780439064873|9780439554893', 'J.K. Rowling', 5, 4, 341, 1998, 'Harry returns to Hogwarts and uncovers the mystery of the Chamber of Secrets.', 'English', NULL),
('Harry Potter and the Prisoner of Azkaban', '9780439136358|9780439655485', 'J.K. Rowling', 5, 4, 435, 1999, 'Harry learns the truth about his parents'' past and meets the mysterious Sirius Black.', 'English', NULL),
('Harry Potter and the Goblet of Fire', '9780439139595|9780439139601', 'J.K. Rowling', 5, 4, 734, 2000, 'Harry competes in the dangerous Triwizard Tournament.', 'English', NULL),
('Harry Potter and the Order of the Phoenix', '9780439358071|9780439785969', 'J.K. Rowling', 5, 4, 870, 2003, 'Harry faces increasing danger as he battles the rising power of Lord Voldemort.', 'English', NULL),
('Harry Potter and the Half-Blood Prince', '9780439784542|9780439785969', 'J.K. Rowling', 5, 4, 652, 2005, 'Harry learns about Voldemort’s past and the secret to his power.', 'English', NULL),
('Harry Potter and the Deathly Hallows', '9780545139700|9780545010221', 'J.K. Rowling', 5, 4, 759, 2007, 'The final battle between Harry and Voldemort unfolds.', 'English', NULL),

('Percy Jackson & The Olympians: The Lightning Thief', '9780786838653|9781423103349', 'Rick Riordan', 5, 4, 377, 2005, 'Percy Jackson discovers he is a demigod and embarks on a quest to prevent a war among the gods.', 'English', NULL),
('Percy Jackson & The Olympians: The Sea of Monsters', '9781423103349|9781423103349', 'Rick Riordan', 5, 4, 279, 2006, 'Percy and his friends seek the Golden Fleece to save Camp Half-Blood.', 'English', NULL),
('Percy Jackson & The Olympians: The Titan''s Curse', '9781423101451|9781423103349', 'Rick Riordan', 5, 4, 312, 2007, 'Percy and his friends must save a new demigod and battle an ancient enemy.', 'English', NULL),
('Percy Jackson & The Olympians: The Battle of the Labyrinth', '9781423101468|9781423103349', 'Rick Riordan', 5, 4, 361, 2008, 'Percy ventures into the Labyrinth to stop an army from attacking Camp Half-Blood.', 'English', NULL),
('Percy Jackson & The Olympians: The Last Olympian', '9781423101475|9781423103349', 'Rick Riordan', 5, 4, 381, 2009, 'Percy and the demigods fight in a final battle to protect Mount Olympus.', 'English', NULL),

('The Hunger Games', '9780439023481|9780439023528', 'Suzanne Collins', 4, 5, 374, 2008, 'In a dystopian future, Katniss Everdeen volunteers for the deadly Hunger Games.', 'English', NULL),
('Catching Fire', '9780439023498|9780439023528', 'Suzanne Collins', 4, 5, 391, 2009, 'Katniss and Peeta face a new challenge in the Quarter Quell.', 'English', NULL),
('Mockingjay', '9780439023511|9780439023528', 'Suzanne Collins', 4, 5, 390, 2010, 'Katniss becomes the symbol of the rebellion against the Capitol.', 'English', NULL);


INSERT INTO book_genre (book_id, genre_id) VALUES
(1, 5), 
(2, 5), 
(3, 5), 
(4, 5), 
(5, 5), 
(6, 5), 
(7, 5), 
(8, 5), 
(9, 5), 
(10, 5),
(11, 5),
(12, 5),
(13, 5),
(14, 5),
(15, 5);

INSERT INTO book_tag (book_id, tag_id) VALUES
(1, 1), 
(2, 1), 
(3, 1), 
(4, 1), 
(5, 1), 
(6, 1), 
(7, 1), 
(8, 1), 
(9, 1), 
(10, 1),
(11, 1),
(12, 1),
(13, 3),
(14, 3),
(15, 3);

INSERT INTO location (campus_id, location_name) VALUES 
(1, 'storage'),
(1, 'shelf'),
(1, 'downstairs');

INSERT INTO inventory (qr, book_id, location_id, campus_id, ttl)
VALUES
('ab0001', 1, 1, 1, '123456789'),
('ab0002', 2, 1, 1, '123456789'),
('ab0003', 3, 1, 1, '123456789'),
('ab0004', 4, 1, 1, '123456789'),
('ab0005', 5, 1, 1, '123456789'),
('ab0006', 6, 1, 1, '123456789'),
('ab0007', 7, 1, 1, '123456789'),
('ab0008', 8, 1, 1, '123456789'),
('ab0009', 9, 1, 1, '123456789'),
('ab0010', 10, 1, 1, '123456789'),
('ab0011', 11, 1, 1, '123456789'),
('ab0012', 12, 1, 1, '123456789'),
('ab0013', 13, 1, 1, '123456789'),
('ab0014', 14, 1, 1, '123456789'),
('ab0015', 15, 1, 1, '123456789'),
('ab0016', 1, 1, 2, '123456789'),
('ab0017', 2, 1, 2, '123456789'),
('ab0018', 3, 1, 2, '123456789'),
('ab0019', 4, 1, 2, '123456789'),
('ab0020', 5, 1, 2, '123456789'),
('ab0021', 6, 1, 2, '123456789'),
('ab0022', 7, 1, 2, '123456789'),
('ab0023', 8, 1, 2, '123456789'),
('ab0024', 9, 1, 2, '123456789'),
('ab0025', 10, 1, 2, '123456789'),
('ab0026', 11, 1, 2, '123456789'),
('ab0027', 12, 1, 2, '123456789'),
('ab0028', 13, 1, 2, '123456789'),
('ab0029', 14, 1, 2, '123456789'),
('ab0030', 15, 1, 2, '123456789');