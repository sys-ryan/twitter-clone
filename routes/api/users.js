const express = require("express");

const route = express.Router();

route.put("/:userId/follow", async (req, res, next) => {
  res.status(200).send("follow!");
});

module.exports = route;
