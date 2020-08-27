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
  app.get("/login", function(request, response) {
    log("GET REQUEST AT /login");
    if (request.isAuthenticated()) {
      response.redirect("/dashboard");
    } else {
      response.render("pages/login.ejs");
    }
  });
  // @route POST api/users/login
  // @desc Login user and start express session
  // @access Public
  app.post("/api/users/login", (request, response, done) => {
    log("POST REQUEST AT /api/users/login");
    done();
  }, validateLoginInput, passport.authenticate("local", { failureRedirect: "/login", successRedirect: "/dashboard" }));

  app.get("/register", (request, response) => {
    log("GET REQUEST AT /register");
    if (request.isAuthenticated()) {
      response.redirect("/dashboard");
    } else {
      response.render("pages/register.ejs");
    }
  })
  app.post("/api/users/register", (request, response, done) => {
    log("POST REQUEST AT /api/users/register");
    done();
  }, validateRegisterInput,
  async function(request, response, done) {
    let packet = {
      status: ""
    }
    User.findOne({ email: request.body.email }, function(error, user) {
      if (user) {
        packet.status = "EXISTING_USER";
        return response.json(packet);
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
            response.json(packet);
            let registrationEmail = {
              subject: "Account Registration",
              text: "You've registered your account with R6 Stratbook. Thanks!"
            };
            email(user.email, registrationEmail.subject, registrationEmail.text);
          });
        } else {
          packet.status = "UNABLE_TO_REGISTER";
          response.render("pages/register.ejs", {
            status: packet.status
          });
        }
      }
    });
  });

  app.get("/api/users/logout", (request, response, done) => {
    log("GET REQUEST at /api/users/logout");
    request.logout();
    response.redirect("/login");
  })
};
