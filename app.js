const path = require("path");

const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");

const middleware = require("./middleware");

const app = express();

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const loginRoute = require("./routes/loginRoutes");
const registerRoute = require("./routes/registerRoutes");

app.use("/login", loginRoute);
app.use("/register", registerRoute);

app.get("/", middleware.requireLogin, (req, res, next) => {
  var payload = {
    pageTitle: "Home",
  };
  res.render("home", payload);
});
app.listen(process.env.PORT, () => {
  console.log(`The server is running on port ${process.env.PORT}`);
});
