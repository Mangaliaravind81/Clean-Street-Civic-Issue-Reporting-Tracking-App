const mongoose = require("mongoose");
const Complaint = require("./models/complaint");

async function checkData() {
  await mongoose.connect("mongodb://127.0.0.1:27017/cleanstreet");
  const complaints = await Complaint.find().limit(5).lean();
  console.log(JSON.stringify(complaints, null, 2));
  process.exit();
}

checkData();
