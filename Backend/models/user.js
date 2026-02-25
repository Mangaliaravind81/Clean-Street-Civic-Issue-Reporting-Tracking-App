const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  location: String,
  profilePhoto: String,
});

module.exports = mongoose.model("User", UserSchema);
