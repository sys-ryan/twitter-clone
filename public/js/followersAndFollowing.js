$(document).ready(() => {
  if (selectedTab === "followers") {
    loadFollowers();
  } else {
    loadFollowing();
  }
});

const loadFollowers = async () => {
  $.get(`/api/users/${profileUserId}/followers`, (results) => {
    outputUsers(results, $(".resultsContainer"));
  });
};

const loadFollowing = async () => {
  $.get(`/api/users/${profileUserId}/following`, (results) => {
    outputUsers(results, $(".resultsContainer"));
  });
};

const outputUsers = (data, container) => {
  console.log(data);
};
