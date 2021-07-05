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
  let chatName = "Chat name"; // TODO
  let image = ""; // TODO
  let latestMessage = "This is the latest message";

  return `
    <a href="/messages/${chatData._id}" class="resultListItem">
      <div class="resultsDetailsContainer">
        <span class="heading">${chatName}</span>
        <span class="subText">${latestMessage}</span>
      </div>
    </a>
  `;
}
