const express = require("express");

const route = express.Router();

const User = require("../../models/User");

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

    res.status(200).send(req.session.user);
  } catch (err) {
    if (!err.statudCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

module.exports = route;
