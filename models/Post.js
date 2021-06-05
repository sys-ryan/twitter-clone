const mongosoe = require("mongoose");
const Schema = mongoose.Schema;

const User = require("./User");

const PostSchema = new Schema(
  {
    content: {
      type: String,
      trim: true,
    },
    postBody: {
      type: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    },
    pinned: Boolean,
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
module.exports = Post;
