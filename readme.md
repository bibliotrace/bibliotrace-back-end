# BiblioTrace Back-End Application

This is a back-end server application for the BiblioTrace library manager.

### Example of google books api
```
/*
google example search for book by isbn number
curl -X GET "localhost:3000/api/google/1338878921" -H 'Content-Type: application/json'
*/
app.get("/api/google/:isbn", async (req, res) => {
  response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=+isbn:${req.params.isbn}&key=${google_api_key}`
  );

  json = await response.json();
  res.send(json);
});

/*
google example search for general query
curl -X GET "localhost:3000/api/google/query/harrypotter" -H 'Content-Type: application/json'
*/
app.get("/api/google/query/:query", async (req, res) => {
  response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${req.params.query}&key=${google_api_key}`
  );

  json = await response.json();
  res.send(json);
});
```
## Database setup:
If mysql is not installed on your device, you can install it using `sudo apt install mysql-server` on Linux or by following the [installation instructions](https://dev.mysql.com/downloads/) from Oracle.
This README assumes that you are using Linux, but feel free to adapt the below instructions to your operating system.  
### Creating the Database
As a placeholder for AWS RDS, we will be running an instance of MySQL locally. MySQL only allows .sql file imports into an existing database, which means you will need to manually create and name the database matching the credentials in `MySQLDao.ts` (note that if you would prefer to use different credentials on your computer that you will need to modify the credentials in this file). This can be accomplished with the following series of commands:
```
$ mysql -u username -p
Password:
$ CREATE DATABASE IF NOT EXISTS bibliotrace_v3;
```
Once the database exists, we can import the .sql file as follows (after logging out of the mysql session): 
```
$ mysql -u username -p bibliotrace_v3 < /path/to/bibliotrace_v3.sql
```
This should automatically create and populate the necessary tables in the database, which is necessary for endpoint testing.
