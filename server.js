// IMPORT PACKAGES
const express = require("express");                   // For use in routing and middleware
const session = require("express-session");           // For use in user sessions
const mongoose = require("mongoose");                 // For use in database connections
const MongoStore = require("connect-mongo")(session)  // For use in session storage
const bodyParser = require("body-parser");            // For use in parsing incoming requests
const passport = require("passport");                 // For use in authentication
const path = require("path");                         // For use in directory management
const email = require("./config/email");              // For use in sending emails

require("dotenv").config();                           // For use in environment variables

// IMPORT UTILITY FUNCTIONS
const { log } = require("./config/utilities");

// SETUP EXPRESS
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.set("view-engine", "ejs");

// SETUP DATABASE
const URI = process.env.MONGODB_URI;
// Handle error in establishing connection
let sessionStore;
try {
  const connection = mongoose.createConnection(URI, { useNewUrlParser: true, useUnifiedTopology: true });
  mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });
  sessionStore = new MongoStore({ mongooseConnection: connection, collection: "session" });
  log("CONNECTION TO DATABASE ESTABLISHED.");
} catch(error) {
  log("ERROR WHILE CONNECTING TO DATABASE: " + error);
}
// Handle error after connection has been established
mongoose.connection.on("error", (error) => {
  log("DATABASE ERROR: " + error);
});

// IMPLEMENT AUTHENTICATION
require("./config/auth")(passport, app, sessionStore);

// IMPLEMENT ROUTES
require("./routes/users")(app, passport);
app.get("/", function(request, response) {
  log("GET REQUEST AT /");
  response.render("pages/index.ejs", {
    loggedIn: request.isAuthenticated()
  });
});
app.get("/dashboard", function(request, response) {
  log("GET REQUEST AT /dashboard");
  if (request.isAuthenticated()) {
    response.render("pages/dashboard.ejs");
  } else {
    response.redirect("/login");
  }
})

// DEFINE PORT AND DEPLOY SERVER
const port = process.env.PORT || 5000;
app.listen(port, () => {
  log("DEPLOY SERVER: Server running on port " + port);
});
