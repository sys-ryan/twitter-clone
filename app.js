const path = require("path");

const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
require("./db/mongoose");
const session = require("express-session");

const middleware = require("./middleware");

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "ryan kim",
    resave: true,
    saveUninitialized: false,
  })
);

// Routes
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");
const logoutRoute = require("./routes/logout");

// API routes
const postsApiRoutes = require("./routes/api/posts");

app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);

app.use("/api/posts", postsApiRoutes);

app.get("/", middleware.requireLogin, (req, res, next) => {
  var payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
  };

  res.render("home", payload);
});
app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${process.env.PORT}`);
});
