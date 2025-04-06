# BiblioTrace Back-End Application

This is a back-end server application for the BiblioTrace library manager.

## Knowledge Tidbits

### Search System

Currently, the search system is designed to pull a cache of all book data once every 2 minutes. This cache is written into a FlexSearch index using 
LatinExtra encoding, which allows for high fault tolerance (For example, the query "Hiry Poiter" will pull up all Harry Potter entries). If the book data
becomes too large, you will notice memory bottlenecks and high latency. To speed up search, you can scale down the search options so it does more strict
search optimizations by changing the searchOptions variable in the SearchDataService's callout to new Worker(searchOptions).

## Database setup:
If mysql is not installed on your device, you can install it using `sudo apt install mysql-server` on Linux or by following the [installation instructions](https://dev.mysql.com/downloads/) from Oracle.
This README assumes that you are using Linux, but feel free to adapt the below instructions to your operating system.  
### Creating the Database
As a placeholder for AWS RDS, we will be running an instance of MySQL locally. MySQL only allows .sql file imports into an existing database, which means you will need to manually create and name the database using a MySQL user matching the credentials in `MySQLDao.ts`. This can be accomplished with the following series of commands:
```
$ mysql -u root -p
Password:
mysql> CREATE DATABASE IF NOT EXISTS bibliotrace_v3;
mysql> CREATE USER 'admin'@'localhost' INDENTIFIED BY 'password';
mysql> GRANT ALL PRIVILEGES ON bibliotrace_v3.* TO 'admin'@'localhost';
```
Now that the database exists with administrative credentials, we can import the .sql file as follows (after logging out of the mysql session with the `quit` command): 
```
$ mysql -u admin -p bibliotrace_v3 < /path/to/empty_schema.sql
Password:
```
This should automatically create and populate the necessary tables in the database, which is necessary for endpoint testing.
### Exporting the Database
[This article](https://www.thegeekstuff.com/2008/09/backup-and-restore-mysql-database-using-mysqldump/#more-184) from thegeekstuff explains how to export all contents of the database into a file and also reimport the contents into a new database. Note that the `mysqldump` also includes the database table creation statements, which means that on reimport that only a database matching the provided name needs to exist.
