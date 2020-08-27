const bcrypt = require("bcryptjs");
const email = require("../config/email.js");

const { log, hashPassword } = require("../config/utilities");

// Load input validation
const validateRegisterInput = require("../validation/register");
const validateLoginInput = require("../validation/login");

// Load User model
require("../models/User");
const User = require("../models/User");

module.exports = async (app, passport) => {
  app.get("/login", (request, response) => {
    log("GET REQUEST AT /login");
    if (request.isAuthenticated()) {
      response.redirect("/dashboard");
    } else {
      response.render("pages/login.ejs", {
        errors: null
      });
    }
  });
  app.get("/login-failure", (request, response) => {
    log("GET REQUEST AT /login-failure");
    response.render("pages/login-failure.ejs");
  });
  app.post("/api/users/login", (request, response, done) => {
    log("POST REQUEST AT /api/users/login");
    done();
  }, validateLoginInput, passport.authenticate("local", { failureRedirect: "/login-failure", successRedirect: "/dashboard" }));

  app.get("/register", (request, response) => {
    log("GET REQUEST AT /register");
    if (request.isAuthenticated()) {
      response.redirect("/dashboard");
    } else {
      response.render("pages/register.ejs", {
        errors: null
      });
    }
  })
  app.post("/api/users/register", (request, response, done) => {
    log("POST REQUEST AT /api/users/register");
    done();
  }, validateRegisterInput,
  async (request, response, done) => {
    let packet = {
      status: ""
    }
    User.findOne({ email: request.body.email }, function(error, user) {
      if (user) {
        packet.status = "EXISTING_USER";
        packet.errors = "User already exists.";
        response.render("pages/register-failure.ejs", {
          status: packet.status,
          errors: packet.errors
        });
      } else {
        const newUser = new User({
          username: request.body.username,
          email: request.body.email,
          platform: request.body.platform,
          password: request.body.password1
        });
        // Hash password before saving in database
        let hashedPassword = hashPassword(request.body.password1);
        if (hashedPassword) {
          newUser.password = hashedPassword;
          newUser.save().then(user => {
            packet.status = "USER_REGISTERED";
            response.redirect("/login");
            let registrationEmail = {
              subject: "SUBJECT",
              text: "TEXT"
            };
            email(user.email, registrationEmail.subject, registrationEmail.text);
          });
        } else {
          packet.status = "UNABLE_TO_REGISTER";
          packet.errors = "Unable to register user.";
          response.render("pages/register.ejs", {
            status: packet.status,
            errors: packet.errors
          });
        }
      }
    });
  });

  app.get("/logout", (request, response, done) => {
    log("GET REQUEST at /api/users/logout");
    request.logout();
    response.redirect("/login");
  })
};
