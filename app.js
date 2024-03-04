var express = require("express"); // Import express
var path = require("path"); // Import path module
var app = express(); // Creates express application
const { engine } = require("express-handlebars"); // Import handlebars module
const booksData = require("./datasetA.json"); // Load books data

const port = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, "public"))); // Serve static files from public folder

// Setting up Handlebars view engine
app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");

const hbs = engine({
  extname: ".hbs",
  // Define custom helpers
  helpers: {
    formatAvgReviews: function (avgReviews) {
      return avgReviews ? avgReviews : "N/A";
    },
    highlightEmptyReviews: function (avgReviews, options) {
      // If avgReviews is empty, add 'highlight' 
      return avgReviews ? "" : "highlight";
    },
  },
});

app.engine(".hbs", hbs);


// Define home page
app.get("/", function (req, res) {
  res.render("index", { title: "Express" });
});

app.use(express.urlencoded({ extended: true }));

// Define /users page
app.get("/users", function (req, res) {
  res.send("respond with a resource");
});

// Display all books data
app.get("/allData", (req, res) => {
  res.render("allData", { title: "All Books", books: booksData });
});


// Display book details by index
app.get("/data/isbn/:index", (req, res) => {
  const index = parseInt(req.params.index, 10);
  if (!isNaN(index) && index >= 0 && index < booksData.length) {
    const book = booksData[index];
    res.render("book", { book: book });
  } else {
    res
      .status(404)
      .render("error", { message: "Book not found for the given index." });
  }
});

// Display ISBN search form
app.get("/data/search/isbn", (req, res) => {
  res.render("search-isbn");
});

// Handle ISBN search
app.post("/data/search/isbn", (req, res) => {
  const isbn = req.body.isbn;
  const book = booksData.find((book) => book.ISBN_13 === isbn);
  if (book) {
    res.render("results", { books: [book] });
  } else {
    res
      .status(404)
      .render("error", { message: "Book not found with the given ISBN." });
  }
});

app.get("/data/search/title", (req, res) => {
  res.render("search-title", { title: "Search by Title" });
});

app.post("/data/search/title", (req, res) => {
  const title = req.body.title.toLowerCase(); // Convert to lowercase for case-insensitive comparison
  const foundBooks = booksData.filter((book) =>
    book.title.toLowerCase().includes(title)
  );
  if (foundBooks.length > 0) {
    res.render("results", { title: "Search Results", books: foundBooks });
  } else {
    res
      .status(404)
      .render("error", { message: "No books found with the given title." });
  }
});


// Handle undefined routes
app.get("*", function (req, res) {
  res.render("error", { title: "Error", message: "Wrong Route" });
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
