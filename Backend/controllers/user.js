// const User = require("../models/user.js");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// module.exports.registerUser = async (req, res) => {
//   const { email, password, role } = req.body;

//   const user = await User.findOne({ email });
//   if (user) return res.json({ message: "User already exists" });

//   const hashed = await bcrypt.hash(password, 10);

//   await User.create({ email, password: hashed, role });

//   res.json({ message: "Registered" });
// };

// module.exports.loginUser = async (req, res) => {
//   const { email, password, role } = req.body;

//   const user = await User.findOne({ email, role });
//   if (!user) return res.json({ success: false });

//   const match = bcrypt.compare(password, user.password);
//   if (!match) return res.json({ success: false });

//   const token = jwt.sign({ id: user._id }, "secret123");

//   res.json({ success: true, token });
// };

const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body; // ✅ get name

  const user = await User.findOne({ email });
  if (user) return res.json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  // ✅ save name also
  await User.create({
    name,
    email,
    password: hashed,
    role,
  });

  res.json({ message: "Registered" });
};

module.exports.loginUser = async (req, res) => {
  const { email, password, role } = req.body;

  const user = await User.findOne({ email, role });
  if (!user) return res.json({ success: false });

  const match = await bcrypt.compare(password, user.password); // ✅ await
  if (!match) return res.json({ success: false });

  const token = jwt.sign({ id: user._id }, "secret123");

  // ✅ return name to frontend
  res.json({
    success: true,
    token,
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};
