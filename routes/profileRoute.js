const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");

const route = express.Router();

route.get("/", (req, res, next) => {
  console.log(req.session.user);
  const payload = {
    pageTitle: req.session.user.username,
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    profileUser: req.session.user,
  };

  res.status(200).render("profilePage", payload);
});

route.get("/:username", async (req, res, next) => {
  const payload = await getPayload(req.params.username, req.session.user);

  res.status(200).render("profilePage", payload);
});

const getPayload = async (username, userLoggedIn) => {
  let user = await User.findOne({ username });

  if (!user) {
    user = await User.findById(username);

    if (!user) {
      return {
        pageTitle: "User not found",
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
      };
    }
  }

  return {
    pageTitle: user.username,
    userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    profileUser: user,
  };
};

module.exports = route;
