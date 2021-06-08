const express = require("express");

const route = express.Router();

const Post = require("../../models/Post");
const User = require("../../models/User");

route.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("postedBy")
      .sort({ createdAt: -1 });
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

route.put("/:id/like", async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  const isLiked =
    req.session.user.likes && req.session.user.likes.includes(postId);

  let option = isLiked ? "$pull" : "$addToSet";
  // insert user like

  try {
    req.session.user = await User.findByIdAndUpdate(
      userId,
      { [option]: { likes: postId } },
      { new: true }
    ); // $addToSet (add) <--> $pull (remove)

    // insert post like
    const post = await Post.findByIdAndUpdate(
      postId,
      { [option]: { likes: userId } },
      { new: true }
    );

    res.status(200).send(post);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

module.exports = route;
