$(document).ready(() => {
  $.get("/api/chats", (data, status, xhr) => {
    if (xhr.status === 400) {
      return alert("Could not get chat list.");
    }

    outputChatList(data, $(".resultsContainer"));
  });
});

function outputChatList(chatList, container) {
  chatList.forEach((chat) => {
    let html = createChatHtml(chat);
    container.append(html);
  });

  if (chatList.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}

function createChatHtml(chatData) {
  let chatName = getChatName(chatData); // TODO
  let image = getChatImageElements(chatData); // TODO
  let latestMessage = "This is the latest message";

  return `
    <a href="/messages/${chatData._id}" class="resultListItem">
    ${image}
      <div class="resultsDetailsContainer ellipsis">
        <span class="heading ellipsis">${chatName}</span>
        <span class="subText ellipsis">${latestMessage}</span>
      </div>
    </a>
  `;
}

function getChatImageElements(chatData) {
  const otherChatUsers = getOtherChatUsers(chatData.users);

  let groupChatClass = "";
  let chatImage = getUserChatImageElement(otherChatUsers[0]);

  if (otherChatUsers.length > 1) {
    groupChatClass = "groupChatImage";
    chatImage += getUserChatImageElement(otherChatUsers[1]);
  }

  return `<div class="resultsImageContainer ${groupChatClass}">${chatImage}</div>`;
}

function getUserChatImageElement(user) {
  if (!user || !user.profilePic) {
    return alert("User passed into function is invalid");
  }

  return `
    <img src="${user.profilePic}" alt="User's profile pic">
  `;
}
