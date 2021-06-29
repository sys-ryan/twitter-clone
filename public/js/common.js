// Globals
let cropper;

$("#postTextarea, #replyTextarea").keyup((event) => {
  const textbox = $(event.target);
  const value = textbox.val().trim();

  const isModal = textbox.parents(".modal").length == 1;

  const submitButton = isModal
    ? $("#submitReplyButton")
    : $("#submitPostButton");

  if (value == "") {
    submitButton.prop("disabled", true);
    return;
  }

  submitButton.prop("disabled", false);
});

$("#submitPostButton, #submitReplyButton").click((event) => {
  const button = $(event.target);

  const isModal = button.parents(".modal").length == 1;

  const textbox = isModal ? $("#replyTextarea") : $("#postTextarea");

  const data = {
    content: textbox.val(),
  };

  if (isModal) {
    const id = button.data().id;
    if (!id) {
      return console.log("button id is null");
    }
    data.replyTo = id;
  }

  $.post("/api/posts", data, (postData, status, xhr) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      const html = createPostHtml(postData);

      $(".postsContainer").prepend(html);
      textbox.val("");
      button.prop("disabled", true);
    }
  });
});

const createPostHtml = (postData, largeFont = false) => {
  if (!postData) {
    console.log("post object is null");
  }

  const isRetweet = postData.retweetData !== undefined;
  const retweetedBy = isRetweet ? postData.postedBy.username : "";
  postData = isRetweet ? postData.retweetData : postData;

  const postedBy = postData.postedBy;

  const displayName = `${postedBy.firstName} ${postedBy.lastName}`;
  const timestamp = timeDifference(new Date(), new Date(postData.createdAt));

  const likeButtonActiveClass = postData.likes.includes(userLoggedIn._id)
    ? "active"
    : "";

  const retweetButtonActiveClass = postData.retweetUsers.includes(
    userLoggedIn._id
  )
    ? "active"
    : "";

  const largeFontClass = largeFont ? "largeFont" : "";

  let retweetText = "";
  if (isRetweet) {
    retweetText = `
      <span>
        <i class='fas fa-retweet'></i>
        Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
      </span>
    `;
  }

  let replyFlag = "";
  if (postData.replyTo && postData.replyTo._id) {
    if (!postData.replyTo._id) {
      return console.log("replyTo is not populated");
    }
    const replyToUsername = postData.replyTo.postedBy.username;

    replyFlag = `<div class='replyFlag'>
                Replying to <a href='/profile/${replyToUsername}'>@${replyToUsername}</a>
              </div>`;
  }

  let buttons = "";
  if (postData.postedBy._id == userLoggedIn._id) {
    buttons = `
      <button data-id="${postData._id}" data-toggle="modal" data-target="#confirmPinModal">
        <i class="fas fa-thumbtack"></i>
      </button>
      <button data-id="${postData._id}" data-toggle="modal" data-target="#deletePostModal">
        <i class="fas fa-times"></i>
      </button>
    `;
  }

  return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
            <div class='postActionContainer'>
              ${retweetText}
            </div>
            <div class='mainContentContainer'>
              <div class='userImageContainer'>
                <img src='${postedBy.profilePic}'/>
              </div>
              <div class='postContentContainer'>
                <div class='header'>
                  <a href='/profile/${
                    postedBy.username
                  }' class='displayName'>${displayName}</a>
                  <span class='username'>@${postedBy.username}</span>
                  <span class='date'>${timestamp}</span>
                  ${buttons}
                </div>
                ${replyFlag}
                <div class='postBody'>
                  <span>${postData.content}</span>
                </div>
                <div class='postFooter'>
                  <div class='postButtonContainer'>
                    <button data-toggle='modal' data-target='#replyModal'>
                      <i class='far fa-comment'></i>
                    </button>
                  </div>
                  <div class='postButtonContainer green'>
                    <button class='retweetButton ${retweetButtonActiveClass}'>
                      <i class='fas fa-retweet'></i>
                      <span>${postData.retweetUsers.length || ""}</span>
                    </button>
                  </div>
                  <div class='postButtonContainer red'>
                    <button class='likeButton ${likeButtonActiveClass}'>
                      <i class='far fa-heart'></i>
                      <span>${postData.likes.length || ""}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
};

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) return "Just now";
    return Math.round(elapsed / 1000) + " seconds ago";
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
}

$("#replyModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#submitReplyButton").data("id", postId);

  let post = $.get(`/api/posts/${postId}`).then((result) => {
    outputPosts(result.postData, $("#originalPostContainer"));
  });
});

$("#replyModal").on("hidden.bs.modal", (event) => {
  $("#originalPostContainer").html("");
});

$("#deletePostModal").on("show.bs.modal", (event) => {
  const button = $(event.relatedTarget);
  const postId = getPostIdFromElement(button);
  $("#deletePostButton").data("id", postId);
});

$("#deletePostButton").click((event) => {
  const postId = $(event.target).data("id");

  $.ajax({
    url: `/api/posts/${postId}`,
    type: "DELETE",
    success: (data, status, xhr) => {
      //data: returned data
      //status: success message
      //xhr.status: status Code

      location.reload();
    },
  });
});

$("#filePhoto").change((event) => {
  const input = event.target;

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById("imagePreview");
      image.src = e.target.result;

      if (cropper) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 1 / 1,
        backgroudn: false,
      });
    };

    reader.readAsDataURL(input.files[0]);
  }
});

$("#coverPhoto").change((event) => {
  const input = event.target;

  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const image = document.getElementById("coverPreview");
      image.src = e.target.result;

      if (cropper) {
        cropper.destroy();
      }

      cropper = new Cropper(image, {
        aspectRatio: 16 / 9,
        background: false,
      });
    };
    reader.readAsDataURL(input.files[0]);
  }
});

$("#imageUploadButton").click(() => {
  const canvas = cropper.getCroppedCanvas();

  if (!canvas) {
    return alert("Could not upload image. Make sure it is an image file.");
  }

  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: `/api/users/profilePicture`,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        location.reload();
      },
    });
  });
});

$("#coverPhotoUploadButton").click(() => {
  const canvas = cropper.getCroppedCanvas();

  if (!canvas) {
    return alert("Could not upload image. Make sure it is an image file.");
  }

  canvas.toBlob((blob) => {
    const formData = new FormData();
    formData.append("croppedImage", blob);

    $.ajax({
      url: `/api/users/coverPhoto`,
      type: "POST",
      data: formData,
      processData: false,
      contentType: false,
      success: () => {
        location.reload();
      },
    });
  });
});

$(document).on("click", ".likeButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (!postId) {
    return;
  }

  $.ajax({
    url: `/api/posts/${postId}/like`,
    type: "PUT",
    success: (postData) => {
      button.find("span").text(postData.likes.length || "");

      if (postData.likes.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".followButton", (event) => {
  const button = $(event.target);
  const userId = button.data().user;

  $.ajax({
    url: `/api/users/${userId}/follow`,
    type: "PUT",
    success: (data, status, xhr) => {
      if (xhr.status === 404) {
        return;
      }

      let difference = 1;
      if (data.following && data.following.includes(userId)) {
        button.addClass("following");
        button.text("Following");
      } else {
        button.removeClass("following");
        button.text("Follow");
        difference = -1;
      }

      const followersLabel = $("#followersValue");
      if (followersLabel.length != 0) {
        let followersText = followersLabel.text();
        followersText = parseInt(followersText);
        followersLabel.text(followersText + difference);
      }
    },
  });
});

const getPostIdFromElement = (element) => {
  const isRoot = element.hasClass("post");
  const rootElement = isRoot ? element : element.closest(".post");
  const postId = rootElement.data().id; //data-id

  if (!postId) {
    return console.log("Post id undefined");
  }

  return postId;
};

$(document).on("click", ".retweetButton", (event) => {
  const button = $(event.target);
  const postId = getPostIdFromElement(button);

  if (!postId) return;

  $.ajax({
    url: `/api/posts/${postId}/retweet`,
    type: "POST",
    success: (postData) => {
      button.find("span").text(postData.retweetUsers.length || "");

      if (postData.retweetUsers.includes(userLoggedIn._id)) {
        button.addClass("active");
      } else {
        button.removeClass("active");
      }
    },
  });
});

$(document).on("click", ".post", (event) => {
  const element = $(event.target);
  const postId = getPostIdFromElement(element);

  if (postId && !element.is("button")) {
    window.location.href = "/posts/" + postId;
  }
});

function outputPosts(results, container) {
  container.html("");

  if (!Array.isArray(results)) {
    results = [results];
  }

  results.forEach((result) => {
    var html = createPostHtml(result);
    container.append(html);
  });

  if (results.length == 0) {
    container.append("<span class='noResults'>Nothing to show</span>");
  }
}

const outputPostsWithReplies = (results, container) => {
  container.html("");

  if (results.replyTo && results.replyTo._id) {
    const html = createPostHtml(results.replyTo);
    container.append(html);
  }

  const mainPostHtml = createPostHtml(results.postData, true);
  container.append(mainPostHtml);

  results.replies.forEach((result) => {
    const html = createPostHtml(result);
    container.append(html);
  });
};
