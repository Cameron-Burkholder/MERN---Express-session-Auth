const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// CREATE USER SCHEMA
const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true
  },
  teamCode: {
    type: String,
    required: false
  },
  verified: {
    type: Boolean,
    required: false
  }
});

module.exports = User = mongoose.model("users", UserSchema);
