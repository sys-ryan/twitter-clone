$(document).ready(() => {
  if (selectedTab === "replies") {
    loadReplies();
  } else {
    loadPosts();
  }
});

const loadPosts = () => {
  console.log(profileUserId);
  $.get(
    "/api/posts",
    { postedBy: profileUserId, isReply: false },
    (results) => {
      outputPosts(results, $(".postsContainer"));
    }
  );
};

const loadReplies = () => {
  console.log(profileUserId);
  $.get("/api/posts", { postedBy: profileUserId, isReply: true }, (results) => {
    outputPosts(results, $(".postsContainer"));
  });
};
