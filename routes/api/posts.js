const express = require("express");

const route = express.Router();

const Post = require("../../models/Post");
const User = require("../../models/User");

route.get("/", async (req, res, next) => {
  const searchObj = req.query;

  if (searchObj.isReply) {
    const isReply = searchObj.isReply === "true";
    searchObj.replyTo = { $exists: isReply };
    delete searchObj.isReply;
  }

  if (searchObj.followingOnly) {
    const followingOnly = searchObj.followingOnly == "true";

    if (followingOnly) {
      const objectIds = [];

      if (!req.session.user.following) {
        req.session.user.following = [];
      }

      req.session.user.following.forEach((user) => {
        objectIds.push(user);
      });
      objectIds.push(req.session.user._id); // own post

      searchObj.postedBy = { $in: objectIds };
    }
    delete searchObj.followingOnly;
  }

  const posts = await getPosts(searchObj);
  res.send(posts);
});

route.get("/:id", async (req, res, next) => {
  const postId = req.params.id;

  let postData = await getPosts({ _id: postId });
  postData = postData[0];

  const results = {
    postData,
  };

  if (postData.replyTo) {
    results.replyTo = postData.replyTo;
  }

  results.replies = await getPosts({ replyTo: postId });

  res.status(200).send(results);
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

  if (req.body.replyTo) {
    postData.replyTo = req.body.replyTo;
  }

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

route.post("/:id/retweet", async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.session.user._id;

  try {
    // Try and delete retweet
    const deletedPost = await Post.findOneAndDelete({
      postedBy: userId,
      retweetData: postId,
    });

    const option = deletedPost ? "$pull" : "$addToSet";
    let repost = deletedPost;

    if (!repost) {
      repost = await Post.create({ postedBy: userId, retweetData: postId });
    }

    req.session.user = await User.findByIdAndUpdate(
      userId,
      { [option]: { retweets: repost._id } },
      { new: true }
    );

    const post = await Post.findByIdAndUpdate(
      postId,
      { [option]: { retweetUsers: userId } },
      { new: true }
    );

    return res.status(200).send(post);
  } catch (error) {
    if (!error.statusCode) {
      statusCode = 500;
    }
    next(error);
  }
});

route.delete("/:id", async (req, res, next) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.sendStatus(202);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
});

route.put("/:id", async (req, res, next) => {
  try {
    console.log(req.body);
    if (req.body.pinned) {
      await Post.updateMany({ postedBy: req.session.user }, { pinned: false });
    }

    await Post.findByIdAndUpdate(req.params.id, req.body);
    res.sendStatus(204);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
});

const getPosts = async (filter) => {
  try {
    let result = await Post.find(filter)
      .populate("postedBy")
      .populate("retweetData")
      .populate("replyTo")
      .sort({ createdAt: -1 });

    result = await User.populate(result, { path: "replyTo.postedBy" });
    return await User.populate(result, { path: "retweetData.postedBy" });
  } catch (error) {
    if (!error.statusCode) {
      statusCode = 500;
    }
    next(error);
  }
};

module.exports = route;
