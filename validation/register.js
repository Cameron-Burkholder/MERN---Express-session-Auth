const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(request, response, done) {

  let data = request.body;
  let packet = {};

  let errors = {};
  data.username = !isEmpty(data.username) ? data.username : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password1 = !isEmpty(data.password1) ? data.password1 : "";
  data.password2 = !isEmpty(data.password2) ? data.password2 : "";

  // Username checks
  if (Validator.isEmpty(data.username)) {
    errors.username = "Username field is required";
  }

  // Email checks
  if (Validator.isEmpty(data.email)) {
    errors.email = "Email field is required.";
  } else if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid.";
  }

  // Password checks
  if (Validator.isEmpty(data.password1)) {
    errors.password1 = "Password field is required.";
  }
  if (Validator.isEmpty(data.password2)) {
    errors.password2 = "Confirm password field is required.";
  }
  if (!Validator.isLength(data.password1, { min: 6, max: 30 })) {
    errors.password1 = "Password must be at least 6 characters and at most 30.";
  }
  if (!Validator.equals(data.password1, data.password2)) {
    errors.password2 = "Passwords must match.";
  }

  if (!isEmpty(errors)) {
    packet.status = "INVALID_LOGIN";
    packet.errors = errors;
    response.render("pages/register.ejs", {
      status: packet.status,
      errors: packet.errors
    });
    response.end();
  } else {
    done();
  }
};
