const express = require("express");

const route = express.Router();

route.get("/", (req, res, next) => {
  const payload = createPaylod(req.session.user);
  res.status(200).render("searchPage", payload);
});

route.get("/:selectedTab", (req, res, next) => {
  let payload = createPaylod(req.session.user);
  payload.selectedTab = req.params.selectedTab;
  res.status(200).render("searchPage", payload);
});

function createPaylod(userLoggedIn) {
  return {
    pageTitle: "Search",
    userLoggedIn: userLoggedIn,
    userLoggedInJs: JSON.stringify(userLoggedIn),
    selectedTab: "posts",
  };
}

module.exports = route;
