const express = require("express");

const Chat = require("../models/Chat");
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

route.get("/:chatId", async (req, res, next) => {
  const userId = req.session.user._id;
  const chatId = req.params.chatId;

  const chat = await Chat.findOne({
    _id: chatId,
    users: { $elemMatch: { $eq: userId } },
  }).populate("users");

  if (chat == null) {
    // Check if chat id is really user id
  }

  let payload = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
    chat,
  };
  res.status(200).render("chatPage", payload);
});

module.exports = route;
