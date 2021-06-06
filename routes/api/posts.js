const express = require("express");

const route = express.Router();

const Post = require("../../models/Post");

route.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.status(200).send(posts);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

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
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

module.exports = route;
