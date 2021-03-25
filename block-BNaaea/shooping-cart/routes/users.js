var express = require("express");
var router = express.Router();
var Users = require("../models/Users");
/* GET users listing. */

router.get("/signup", function (req, res, next) {
  res.render("signup", { error: req.flash("error") });
});

router.post("/signup", (req, res, next) => {
  const user = { ...req.body };
  if (req.body.isAdmin === "on") {
    user.isAdmin = true;
  } else {
    user.isAdmin = false;
  }
  Users.create(user, (err, user) => {
    if (err) {
      if (err.name === "MongoError") {
        req.flash("error", "This email is already used");
        return res.redirect("/users/signup");
      }
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("/users/signup");
      }
    }
    res.redirect("/users/login");
  });
});


router.get("/login", (req, res, next) => {
  res.render("login", { error: req.flash("error") });
});

router.post("/login", function (req, res, next) {
  var { email, password } = req.body;
  if (!email || !password) {
    req.flash("error", "Email/password required");
    return res.redirect("/users/login");
  }
  Users.findOne({ email }, (err, user) => {
    if (err) return next(err);
    if (!user) {
      req.flash("error", "User doesnt exist!! Please signup");
      return res.redirect("/users/login");
    }

    user.verifyPassword(password, (err, result) => {
      if (err) return next(err);
      if (!result) {
        req.flash("error", "password is incorrect");
        return res.redirect("/users/login");
      }
      if(user.isBlock) {
        req.flash("error", "You are block")
        return res.redirect('/users/login')
      }
      req.session.userId = user.id;
      if (user.isAdmin) {
        res.redirect('/items')
      } else {
        res.redirect("/");
      }
    });
  });
});


router.get('/logout' , (req, res)=> {
  req.session.destroy();
  res.clearCookie();
  res.redirect('/users/login');
})

module.exports = router;