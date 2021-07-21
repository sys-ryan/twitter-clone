const express = require("express");

const route = express.Router();

const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const User = require("../../models/User");

route.post("/", async (req, res, next) => {
  if (!req.body.content || !req.body.chatId) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  let newMessage = {
    sender: req.session.user._id,
    content: req.body.content,
    chat: req.body.chatId,
  };

  try {
    let message = await Message.create(newMessage);
    message = await message.populate("sender").populate("chat").execPopulate();
    message = await User.populate(message, { path: "chat.users" });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.status(201).send(message);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

module.exports = route;
