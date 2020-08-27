const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("../models/User");
const { log, verifyPassword } = require("./utilities.js");

module.exports = (passport, app, sessionStore) => {
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, function (err, user) {
        if (err) {
          return done(err);
        }
        done(null, user);
    });
  });

  passport.use(new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password"
    },
    function(email, password, done) {
      User.findOne({ email: email }, function(error, user) {
        if (error) {
          log("ERROR WHILE ATTEMPTING TO FIND USER: " + error);
          return done(error);
        }
        if (!user) {
          return done(null, false);
        } else {
          const isValidPassword = verifyPassword(password, user.password);
          if (isValidPassword) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        }
      });
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());
};
