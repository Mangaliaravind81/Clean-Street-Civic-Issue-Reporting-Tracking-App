const mongoose = require("mongoose");
require("dotenv").config();
const Complaint = require("./models/complaint");
const Zone = require("./models/zone");

const migrate = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/cleanstreet",
    );
    console.log("Connected to MongoDB for migration...");

    // 1. Migrate Complaints
    const complaints = await Complaint.find({ location_coords: { $ne: null } });
    console.log(`Found ${complaints.length} complaints to check...`);

    let complaintcount = 0;
    for (const c of complaints) {
      if (c.location_coords && c.location_coords.includes(",")) {
        const [lat, lng] = c.location_coords.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          c.location = { type: "Point", coordinates: [lng, lat] };
          await c.save();
          complaintcount++;
        }
      }
    }
    console.log(`Updated ${complaintcount} complaints with GeoJSON.`);

    // 2. Migrate Zones
    const zones = await Zone.find({ boundary_coords: { $ne: null } });
    console.log(`Found ${zones.length} zones to check...`);

    let zonecount = 0;
    for (const z of zones) {
      if (z.boundary_coords && z.boundary_coords.includes(",")) {
        const [lat, lng] = z.boundary_coords.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          z.location = { type: "Point", coordinates: [lng, lat] };
          await z.save();
          zonecount++;
        }
      }
    }
    console.log(`Updated ${zonecount} zones with GeoJSON.`);

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrate();
