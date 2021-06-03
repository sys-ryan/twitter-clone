const express = require("express");

const route = express.Router();

route.get("/", (req, res, next) => {
  res.status(200).render("register");
});

route.post("/", (req, res, next) => {
  console.log(req.body);
});

module.exports = route;
