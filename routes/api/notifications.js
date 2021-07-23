const express = require("express");

const router = express.Router();

const Chat = require("../../models/Chat");
const Message = require("../../models/Message");
const User = require("../../models/User");
const Notification = require("../../models/Notification");

router.get("/", async (req, res, next) => {
  let searchObj = {
    userTo: req.session.user._id,
    notificationType: { $ne: "newMessage" },
  };

  if (req.query.unreadOnly) {
    searchObj.opened = false;
  }

  try {
    let notifications = await Notification.find(searchObj)
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

router.get("/latest", async (req, res, next) => {
  try {
    let notifications = await Notification.findOne({
      userTo: req.session.user._id,
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
    const result = await Notification.findByIdAndUpdate(req.params.id, {
      opened: true,
    });
    res.send(result);
    // res.sendStatus(204);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      next(error);
    }
  }
});

router.put("/markAsOpened", async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userTo: req.session.user._id },
      { opened: true }
    );
    res.send(result);
    // res.sendStatus(204);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
      next(error);
    }
  }
});
module.exports = router;
