const mongoose = require("mongoose");
const Notification = require("./models/notification");
const Complaint = require("./models/complaint");
const User = require("./models/user");

async function testEscalation() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cleanstreet");
    console.log("Connected to MongoDB");

    // 1. Create a stale complaint (7 days ago)
    const sampleUser = await User.findOne({ role: "user" });
    if (!sampleUser) {
      console.log("No user found");
      return;
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 10);

    const staleComplaint = await Complaint.create({
      user_id: sampleUser._id,
      title: "Stale Test Issue",
      description: "This issue has been sitting for a long time.",
      status: "received",
      issue_type: "Garbage",
      location_coords: "12.9716,77.5946", // Sample location
      created_at: sevenDaysAgo,
    });

    console.log("Created stale complaint:", staleComplaint._id);

    // 2. Mock a nearby volunteer
    await User.findOneAndUpdate(
      { role: "volunteer" },
      { location_coords: "12.9800,77.6000" }, // Within 20km
    );

    // 3. Test Escalation Level 1 (Volunteers)
    console.log("Testing Escalation Level 1...");
    // logic from controller
    const [cLat, cLng] = staleComplaint.location_coords.split(",").map(Number);
    const volunteers = await User.find({ role: "volunteer" });

    // We'll use the logic directly here or we could hit the API.
    // Since this is a unit-style test for logic:
    const nearby = volunteers.filter((v) => v.location_coords);
    console.log(`Found ${nearby.length} volunteers with location.`);

    // 4. Test API flow (conceptual verification)
    staleComplaint.escalation_level = "volunteers";
    await staleComplaint.save();
    console.log("Simulated Level 1 escalation.");

    // 5. Test Escalation Level 2 (Admin)
    console.log("Testing Escalation Level 2...");
    const admins = await User.find({ role: "admin" });
    console.log(`Found ${admins.length} admins to notify.`);

    staleComplaint.escalation_level = "admin";
    await staleComplaint.save();
    console.log("Simulated Level 2 escalation.");

    // Clean up
    await Complaint.findByIdAndDelete(staleComplaint._id);
    console.log("Cleaned up test data.");

    await mongoose.connection.close();
    console.log("Test finished successfully.");
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testEscalation();
