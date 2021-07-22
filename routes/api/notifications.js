const express = require("express");

const router = express.Router();

const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

router.get("/", async (req, res, next) => {
  try {
    let notifications = await Notification.find({
      userTo: req.session.user._id,
      notificationType: { $ne: "newMessage" },
    })
      .populate("userTo")
      .populate("userFrom")
      .sort({ createdAt: -1 });

    res.status(200).send(notifications);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

router.put("/:id/markAsOpened", async (req, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { opened: true });
    res.sendStatus(204);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      next(error);
    }
  }
});

module.exports = router;
