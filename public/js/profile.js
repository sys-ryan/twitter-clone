$(document).ready(() => {
  loadPosts();
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
