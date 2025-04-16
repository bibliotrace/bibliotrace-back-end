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

## Known bugs/feature requests/improvements 

- Only for local (hence not too important): add some kind of sleep call such that the mysql container can boot up before trying to connect to it 
- Add basic frontend checks for lengths of QR and ISBN to all fields to save some API calls 
- Change password page (manage user?) 
- Clicking on any piece of book information brings up more information about that box. We should probably just have the picture and book title do that. If we’re going to make it so people can click on the author name, genre, and series, it should bring up more information relative to those things (e.g., if someone click on “J.K. Rowling”, it should bring up more books by that author). 
- Can’t add tags or secondary genres to a book that’s being entered for the first time  
- Update cached Google SEO description when searching Bibliotrace 
- Back button (browser) always takes you to the home page 
- Add books from manage inventory page back button routes to admin home page 
- Text size doesn’t respond to the window size consistently (e.g. optimize window scaling for screen size of monitor in use)
- No way to see current list of suggestions on frontend (these are sent by email from bibliotrace@gmail.com every Friday at 8am) 
- Testing suite is incomplete 
- When the container starts in ECS, ECS calls the /health endpoint in the backend a couple times to make sure that the container is actually working. Because there is not a JWT token in the automated request, the logs indicate an UnauthorizedError every time this endpoint is called, which should not be an error. 

 
## Backend deployment notes 

The backend application is containerized using Docker with a connection to an AWS RDS database running MySQL in us-east-1. Deployment is managed through a GitHub Actions workflow, which automatically builds the container, pushes the image to AWS ECR, then starts the container in AWS ECS.  

### Backend workflows 

There are three workflows currently in place for the backend application, which are accessible under the Actions tab in the backend repository.  

The first workflow is titled “CI workflow” and contains steps to run the tests for the backend, run a linter, audit the package dependencies, and verify that the Docker container can still be built. Due to the structure of the DAO tests and some Docker idiosyncrasies, this pipeline often takes about 2-3 minutes to complete successfully. This workflow is triggered when a pull request is opened or when a new commit is pushed to an open pull request. All steps in this workflow will need to pass before the associated pull request can be merged into the main branch. 

The second workflow is titled “pages build and deployment,” which does little more than serve up the repo README at the following link: bibliotrace.github.io/bibliotrace-back-end/. This workflow only triggers when a pull request is merged into the main branch. 

The third workflow is titled “Deploy” and automates the AWS deployment process. This workflow does the following:  

- Transpiles the Typescript code to JS in the /dist folder, 
- Creates an OIDC token to authenticate with AWS for later steps,
- Connects to AWS ECR and rebuilds the container within AWS, 
- Pushes the new container image to ECR, 
- Pulls the container definition out of ECR into AWS ECS (overwriting the current container), 
- Redeploys the container within ECS and waits for the container to stabilize. 

This workflow can take anywhere from 3 to 10 minutes depending on how quickly the container is able to stabilize within ECS. If the “Deploy new container” step fails in the workflow, the ECS logs for the container (found either in the ECS service or in CloudWatch) often reveal the reason that the container failed to start.  

## Local Backend Development 

To run the backend locally, you will need to ensure that no other service is running on port 3306 (e.g. a local instance of MySQL) and that Docker Desktop is running on your computer. Instead of connecting to the production database, this container will test its queries against a separate container running MySQL listening on port 3306. This database is populated with arbitrary dummy data that is reset every time that the container is rebuilt (see config.ts for specifics). This database is also used to run the DAO tests as it was far simpler to just use a separate database instead of mocking every possible database call. 

To build (or rebuild the container), you can run either npm run start or npm run dev to (re)create the container in Docker. The backend service must be running for the front end to work properly. 

NOTE: The default username and passwords in the system for testing are the following:

| username   | password  | campus  | type   |
|------------|-----------|---------|--------|
| test       | test      | Lehi    | admin  |
| user       | user      | SLC     | user   |
| plebian    | adminSpy  | Lehi    | user   |

## Frontend deployment notes 

The frontend application is packaged with Vite into a single page application, which is uploaded to AWS S3. The domain bibliotrace.com is hosted in AWS Route 53 with the AWS Cloudfront CDN providing a path to the application in S3.  

### Frontend workflows 

There are two workflows configured for the frontend repository through GitHub Actions. There are currently no frontend workflows for tests or auditing. 

The first workflow is titled “Deployment Pipeline” and deploys the frontend to GitHub Pages at https://bibliotrace.github.io/bibliotrace-front-end/. This workflow currently does not serve up a live webpage since we changed the repository owner from a single account to a GitHub organization, but it is still possible to run the frontend locally (described later). 

The second workflow is titled “S3 Deployment Pipeline” and does the following: 

- Compiles the project into a single page application with Vite, 
- Replaces all references to localhost in the compiled project with references to the backend service URL running in AWS, 
- Creates an OIDC token to authenticate to AWS,  
- Pushes the compiled application to an S3 bucket (as well as a 404 page for when CloudFront can’t find a URL before the React router gets to a bad URL). 
- This workflow rarely takes longer than a minute to run and is only triggered when a pull request is merged into the main branch. 

## Local frontend development 

Running npm run dev within the frontend repository on your machine will compile the application and serve the page on https://localhost:5173 using Vite. The backend will need to be running separately for the API calls from the frontend to function properly. 

Vite is responsive enough that if you have a frontend instance running locally and a change is made to the frontend application code that the change will be displayed dynamically in the browser. 

## Environment secrets 

Both the frontend and backend deployment scripts rely on a number of environment secrets that are stored within GitHub to avoid accidentally exposing API keys, etc. without needing a .env file stored somewhere in the cloud. These secrets can be accessed and modified by selecting the Settings tab in the GitHub navigation bar for the site repository, then opening the Secrets and Variables menu in the left sidebar and selecting the Actions option. These secrets are primarily related to the resource URLs for the services stored in AWS. 

There are also environment secrets stored in the container task definition of AWS. Note that any changes to these secrets will necessitate redeploying the container in ECS and making sure that the service is associated with the most recent task definition.
