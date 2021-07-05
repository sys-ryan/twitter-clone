$(document).ready(() => {
  $.get("/api/chats", (data, status, xhr) => {
    if (xhr.status === 400) {
      return alert("Could not get chat list.");
    }

    outputChatList(data, $(".resultsContainer"));
  });
});

function outputChatList(chatList, container) {
  console.log(chatList);
}
