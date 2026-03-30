const mongoose = require("mongoose");
const Notification = require("./models/notification");
const Complaint = require("./models/complaint");
const User = require("./models/user");

async function testNotifications() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/cleanstreet");
    console.log("Connected to MongoDB");

    // Find a complaint that HAS a user_id
    const complaint = await Complaint.findOne({ user_id: { $exists: true, $ne: null } });

    if (!complaint) {
      console.log("No valid complaint with user_id found to test with.");
      // Create a dummy one if needed, but let's see if we find any first
      const sampleUser = await User.findOne();
      if (!sampleUser) {
        console.log("No users in DB");
        return;
      }
      console.log("Creating a dummy complaint for testing...");
      const dummy = await Complaint.create({
        user_id: sampleUser._id,
        title: "Test Complaint",
        description: "Test Description",
        status: "received",
        issue_type: "Cleaning"
      });
      verifyNotification(dummy);
    } else {
      console.log(`Found Complaint: ${complaint.title}, User ID: ${complaint.user_id}`);
      await verifyNotification(complaint);
    }

    async function verifyNotification(c) {
      const newStatus = "RESOLVED";
      const notif = await Notification.create({
        user_id: c.user_id,
        complaint_id: c._id,
        message: `Your complaint "${c.title}" status has been updated to ${newStatus}.`,
      });

      console.log("Notification created successfully:", notif._id);

      // Verify
      const latestNotification = await Notification.findById(notif._id);
      console.log("Verified Notification message:", latestNotification.message);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testNotifications();
