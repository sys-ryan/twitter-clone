const express = require("express");

const route = express.Router();

const User = require("../../models/User");

route.put("/:userId/follow", async (req, res, next) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);

  if (user == null) {
    return res.sendStatus(404);
  }

  const isFollowing =
    user.followers && user.followers.includes(req.session.user._id);
  res.status(200).send(isFollowing);
});

module.exports = route;
