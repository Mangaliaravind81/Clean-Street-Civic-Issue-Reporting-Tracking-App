const mongoose = require("mongoose");
const Complaint = require("./models/complaint");

async function checkData() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cleanstreet");
    const complaint = await Complaint.findOne().lean();
    if (complaint) {
      console.log("Fields in Complaint:", Object.keys(complaint));
      console.log("created_at value:", complaint.created_at);
      console.log("createdAt value:", complaint.createdAt);
    } else {
      console.log("No complaints found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

checkData();
