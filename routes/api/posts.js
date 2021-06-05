const express = require("express");

const route = express.Router();

const Post = require("../../models/Post");

route.get("/", (req, res, next) => {});

route.post("/", async (req, res, next) => {
  if (!req.body.content) {
    console.log("Content param not sent with requesrt");
    return res.sendStatus(400);
  }

  const postData = {
    content: req.body.content,
    postedBy: req.session.user,
  };

  try {
    let newPost = await Post.create(postData);
    newPost = await newPost.populate("postedBy").execPopulate();

    res.status(201).send(newPost);
  } catch (err) {
    const error = new Error("Could not create a new post");
    error.statusCode = 400;
    next(error);
  }
});

module.exports = route;
