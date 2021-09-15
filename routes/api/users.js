const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const path = require("path");
const fs = require("fs");

const route = express.Router();

const User = require("../../models/User");
const Notification = require("../../models/Notification");

route.get("/", async (req, res, next) => {
  let searchObj = req.query;

  if (req.query.search) {
    searchObj = {
      $or: [
        { firstName: { $regex: req.query.search, $options: "i" } },
        { lastName: { $regex: req.query.search, $options: "i" } },
        { username: { $regex: req.query.search, $options: "i" } },
      ],
    };
  }

  try {
    const user = await User.find(searchObj);
    res.status(200).send(user);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }

    next(error);
  }
});

route.put("/:userId/follow", async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId);

    if (user == null) {
      return res.sendStatus(404);
    }

    const isFollowing =
      user.followers && user.followers.includes(req.session.user._id);
    const option = isFollowing ? "$pull" : "$addToSet";

    req.session.user = await User.findByIdAndUpdate(
      req.session.user._id,
      { [option]: { following: userId } },
      { new: true }
    );

    await User.findByIdAndUpdate(userId, {
      [option]: { followers: req.session.user._id },
    });

    if (!isFollowing) {
      await Notification.insertNotification(
        userId,
        req.session.user._id,
        "follow",
        req.session.user._id
      );
    }

    res.status(200).send(req.session.user);
  } catch (err) {
    if (!err.statudCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

route.get("/:userId/following", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("following");
    res.status(200).send(user);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

route.get("/:userId/followers", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).populate("followers");
    res.status(200).send(user);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

route.post(
  "/profilePicture",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No file uploaded with ajax request.");
      return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { profilePic: filePath },
        { new: true }
      );

      res.sendStatus(204);
    });
  }
);

route.post(
  "/coverPhoto",
  upload.single("croppedImage"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No file uploaded with ajax request.");
      return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const tempPath = req.file.path;
    const targetPath = path.join(__dirname, `../../${filePath}`);

    fs.rename(tempPath, targetPath, async (error) => {
      if (error) {
        console.log(error);
        return res.sendStatus(400);
      }

      req.session.user = await User.findByIdAndUpdate(
        req.session.user._id,
        { coverPhoto: filePath },
        { new: true }
      );

      res.sendStatus(204);
    });
  }
);
module.exports = route;
