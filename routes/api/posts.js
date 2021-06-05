const express = require("express");

const route = express.Router();

route.get("/", (req, res, next) => {});

route.post("/", async (req, res, next) => {
  if (!req.body.content) {
    console.log("Content param not sent with requesrt");
    return res.sendStatus(400);
  }

  res.status(200).send("It worked");
});
module.exports = route;
