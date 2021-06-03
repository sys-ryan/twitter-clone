const express = require("express");

const route = express.Router();

const User = require("../models/User");

route.get("/", (req, res, next) => {
  res.status(200).render("register");
});

route.post("/", async (req, res, next) => {
  const firstName = req.body.firstName.trim();
  const lastName = req.body.lastName.trim();
  const username = req.body.username.trim();
  const email = req.body.email.trim();
  const password = req.body.password;

  const payload = req.body;

  try {
    if (firstName && lastName && username && email && password) {
      const user = await User.findOne({ $or: [{ username }, { email }] });

      if (!user) {
        // No user found
      } else {
        // User found
        if (email == user.email) {
          payload.errorMessge = "Email already in use.";
        } else {
          payload.errorMessage = "username already in user";
        }
        res.status(200).render("register", payload);
      }
    } else {
      payload.errorMessage = "Make sure each field has a valid value.";
      res.status(200).render("register", payload);
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = route;
