require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const userRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin");
const zoneRoutes = require("./routes/zone");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect("mongodb://127.0.0.1:27017/cleanstreet")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/complaints", complaintRoutes);
app.use("/admin", adminRoutes);
app.use("/zones", zoneRoutes);

app.listen(5000, () => console.log("Server running on 5000"));
