SET @bookid = 99999999;

DELETE FROM book_tag
WHERE book_id > @bookid;

DELETE FROM checkout
WHERE book_id > @bookid;

DELETE FROM inventory
WHERE book_id > @bookid;

DELETE FROM shopping_list
WHERE book_id > @bookid;

DELETE FROM books
WHERE id > @bookid;

