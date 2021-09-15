const express = require("express");

const route = express.Router();

const Chat = require("../../models/Chat");
const User = require("../../models/User");
const Message = require("../../models/Message");

route.post("/", async (req, res, next) => {
  if (!req.body.users) {
    console.log("Users parm not sent with request");
    return res.sendStatus(400);
  }

  const users = JSON.parse(req.body.users);
  if (users.length == 0) {
    console.log("Users array is empty");
    return res.sentStatus(400);
  }

  users.push(req.session.user);

  let chatData = {
    users,
    isGroupChat: true,
  };

  try {
    const results = await Chat.create(chatData);
    res.status(200).send(results);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

route.get("/", async (req, res, next) => {
  try {
    let results = await Chat.find({
      users: { $elemMatch: { $eq: req.session.user._id } },
    })
      .populate("users")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    if (req.query.unreadOnly) {
      results = results.filter((result) => {
        return !result.latestMessage.readBy.includes(req.session.user._id);
      });
    }
    results = await User.populate(results, { path: "latestMessage.sender" });

    res.status(200).send(results);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

route.put("/:chatId", async (req, res, next) => {
  try {
    const results = await Chat.findByIdAndUpdate(req.params.chatId, req.body);
    res.sendStatus(204);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

route.get("/:chatId", async (req, res, next) => {
  try {
    const results = await Chat.findOne({
      _id: req.params.chatId,
      users: { $elemMatch: { $eq: req.session.user._id } },
    }).populate("users");
    res.status(200).send(results);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

route.get("/:chatId/messages", async (req, res, next) => {
  let message = await Message.find({ chat: req.params.chatId }).populate(
    "sender"
  );
  res.send(message);
});

route.put("/:chatId/messages/markAsRead", async (req, res, next) => {
  try {
    await Message.updateMany(
      { chat: req.params.chatId },
      { $addToSet: { readBy: req.session.user._id } }
    );

    res.sendStatus(204);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

module.exports = route;
