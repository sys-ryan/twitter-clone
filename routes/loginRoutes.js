const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");

const route = express.Router();

route.get("/", (req, res, next) => {
  res.status(200).render("login");
});

route.post("/", async (req, res, next) => {
  const username = req.body.logUsername;
  const password = req.body.logPassword;

  const payload = req.body;

  if (req.body.logUsername && req.body.logPassword) {
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });

    if (user) {
      const result = await bcrypt.compare(password, user.password);
      if (result) {
        req.session.user = user;
        return res.redirect("/");
      }
    }
  }
  payload.errorMessage = "Login credentials incorrect!";
  res.status(200).render("login", payload);
});

module.exports = route;
