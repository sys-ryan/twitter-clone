$(document).ready(() => {
  console.log("?");
  $.get("/api/notifications", (data) => {
    console.log(data);
  });
});
