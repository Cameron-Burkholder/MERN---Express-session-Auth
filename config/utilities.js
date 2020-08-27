
const bcrypt = require("bcryptjs");
const saltRounds = 16;

module.exports = {
  // LOG
  // USE: log messages to console with timestamp
  // PARAMS: msg (string)
  // RETURN: n/a
  log: function(msg) {
    console.log(new Date() + " --- " + msg);
  },
  verifyPassword: function(password, hash) {
    let isValidPassword = bcrypt.compareSync(password, hash);
    return isValidPassword;
  },
  hashPassword: function(password) {
    let salt = bcrypt.genSaltSync(saltRounds);
    let hash = bcrypt.hashSync(password, salt);
    return hash;
  }
};
