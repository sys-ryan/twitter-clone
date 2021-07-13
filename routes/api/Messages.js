const express = require("express");

const route = express.Router();

const Chat = require("../../models/Chat");
const Message = require("../../models/Message");

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
    const results = await Message.create(newMessage);
    res.status(201).send(results);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

module.exports = route;
