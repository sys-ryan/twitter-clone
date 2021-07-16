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
    let chat = await Chat.findOne({
      _id: chatId,
      users: { $elemMatch: { $eq: userId } },
    }).populate("users");

    if (!chat) {
      // Check if chat id is really user id
      const userFound = await User.findById(chatId);

      if (userFound) {
        //get chat using user id
        chat = await getChatByUserId(userFound._id, userId);
      }
    }
    if (!chat) {
      payload.errorMessage =
        "Chat does not exist or you do not have permission to view it.";
    } else {
      payload.chat = chat;
    }
  } catch (error) {
    console.log(error);
  }
  res.status(200).render("chatPage", payload);
});

async function getChatByUserId(userLoggedInId, otherUserId) {
  return await Chat.findOneAndUpdate(
    {
      //filtering the data
      isGroupChat: false,
      users: {
        $size: 2,
        $all: [
          // $all : all of the following conditions are met
          { $elemMatch: { $eq: mongoose.Types.ObjectId(userLoggedInId) } },
          { $elemMatch: { $eq: mongoose.Types.ObjectId(otherUserId) } },
        ],
      },
    },
    {
      // data to be updated
      $setOnInsert: {
        users: [userLoggedInId, otherUserId],
      },
    },
    {
      //options
      new: true,
      upsert: true, //if you don't find it, create it.
    }
  ).populate("users");
}

module.exports = route;
