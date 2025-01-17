# BiblioTrace Back-End Application

This is a back-end server application for the BiblioTrace library manager.

Example of google books api
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
