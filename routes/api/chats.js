const express = require("express");

const route = express.Router();

const Chat = require("../../models/Chat");

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
    const results = await Chat.find({
      users: { $elemMatch: { $eq: req.session.user._id } },
    })
      .populate("users")
      .sort({ updatedAt: -1 });
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

module.exports = route;
