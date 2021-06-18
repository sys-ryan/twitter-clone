const express = require("express");
const bcrypt = require("bcrypt");

const User = require("../models/User");

const route = express.Router();

route.get("/:id", (req, res, next) => {
  const payload = {
    pageTitle: "View post",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    postId: req.params.id,
  };

  res.status(200).render("postPage", payload);
});

module.exports = route;
