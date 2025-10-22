const User = require("../models/user.js");

// Render signup form
module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

// Handle signup
module.exports.signup = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Wanderlust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

// Render login form
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// Handle login (passport local strategy middleware is in route)
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome to Wanderlust! You are logged in!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  delete req.session.redirectUrl;
  res.redirect(redirectUrl);
};

// Handle logout
module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
module.exports.login = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};