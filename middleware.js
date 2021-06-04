exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    // console.log(req.session.user);
    return next();
  }

  return res.redirect("/login");
};
