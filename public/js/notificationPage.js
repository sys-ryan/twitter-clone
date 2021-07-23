$(document).ready(() => {
  $.get("/api/notifications", (data) => {
    outputNotificationList(data, $(".resultsContainer"));
  });
});

$("#markNotificationsAsRead").click(() => markNotificationsAsOpend());

function outputNotificationList(notifications, container) {
  notifications.forEach((notification) => {
    const html = createNotificationHtml(notification);
    container.append(html);
  });

  if (notifications.length == 0) {
    container.append("<span class='noResults'>Nothing to show.</span>");
  }
}
