const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    // create and return the newly inserted user
    user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    // respond with the created user data (omit password)
    res.json({
      message: "Registered",
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("registerUser error", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role });
    if (!user) return res.status(401).json({ success: false });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false });

    const token = jwt.sign({ id: user._id }, "secret123");

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("loginUser error", err);
    res.status(500).json({ message: "Server error" });
  }
};
