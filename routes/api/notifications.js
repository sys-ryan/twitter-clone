const express = require("express");

const router = express.Router();

const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

router.get("/", (req, res, next) => {
  res.status(200).send("hi");
});

module.exports = router;
