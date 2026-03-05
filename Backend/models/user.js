const { Schema, model } = require("mongoose");

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "volunteer", "admin"], default: "user" },
  location: String,
  location_coords: String, // Store "lat,lng" for proximity filtering
  phone_number: String,
  bio: String,
  profile_photo: String,
}, { timestamps: true });

module.exports = model("User", UserSchema);
