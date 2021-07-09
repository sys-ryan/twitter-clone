const express = require("express");
const mongoose = require("mongoose");

const Chat = require("../models/Chat");
const User = require("../models/User");
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

  const isValidId = mongoose.isValidObjectId(chatId);

  let payload = {
    pageTitle: "Chat",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user),
  };

  if (!isValidId) {
    payload.errorMessage =
      "Chat does not exist or you do not have permission to view it.";
    return res.render("chatPage", payload);
  }

  try {
    const chat = await Chat.findOne({
      _id: chatId,
      users: { $elemMatch: { $eq: userId } },
    }).populate("users");

    if (!chat) {
      // Check if chat id is really user id
      const userFound = await User.findById(chatId);

      if (userFound) {
        //get chat using user id
      }
    }
    console.log("chat", chat);
    if (!chat) {
      payload.errorMessage =
        "Chat does not exist or you do not have permission to view it.";
    } else {
      payload.chat = chat;
    }
  } catch (error) {
    console.log(error);
  }

  console.log(payload.errorMessage);
  res.status(200).render("chatPage", payload);
});

module.exports = route;
