const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      location,
      profile_photo,
      username,
      phone_number,
      bio,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email },
        {
          username:
            username ||
            Buffer.from(Math.random().toString())
              .toString("base64")
              .substring(0, 8),
        },
      ],
    });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "User or Username already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      username: username || `user_${Math.floor(Math.random() * 10000)}`,
      password: hashed,
      role: role || "user",
      location,
      phone_number,
      bio,
      profile_photo,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" },
    );

    res.status(201).json({
      success: true,
      message: "Registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        role: newUser.role,
        location: newUser.location,
        profile_photo: newUser.profile_photo,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        location: user.location,
        phone_number: user.phone_number,
        bio: user.bio,
        profile_photo: user.profile_photo,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};
module.exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

module.exports.updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      username,
      location,
      profile_photo,
      phone_number,
      bio,
      location_coords,
      role,
    } = req.body;

    if (username) {
      const existing = await User.findOne({
        username,
        _id: { $ne: req.params.id },
      });
      if (existing)
        return res
          .status(400)
          .json({ success: false, message: "Username already taken" });
    }

    let oldUser = null;
    if (role) oldUser = await User.findById(req.params.id);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        username,
        location,
        profile_photo,
        phone_number,
        bio,
        location_coords,
        role,
      },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (role && oldUser && oldUser.role !== role) {
      const Notification = require("../models/notification");
      await Notification.create({
        user_id: user._id,
        message: `Admin has changed your role to ${role.toUpperCase()}.`,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ created_at: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await User.find({ role: "volunteer" }).select(
      "name email phone_number profile_photo _id location location_coords",
    );
    res.json({ success: true, volunteers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Current password incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: hashedPassword });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
