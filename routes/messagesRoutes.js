const express = require("express");

const route = express.Router();

route.get("/", (req, res, next) => {
  let payload = {
    pageTitle: "Inbox",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("inboxPage", payload);
});

route.get("/new", (req, res, next) => {
  let payload = {
    pageTitle: "New Message",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("newMessage", payload);
});

route.get("/:chatId", (req, res, next) => {
  let payload = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };
  res.status(200).render("chatPage", payload);
});

module.exports = route;
