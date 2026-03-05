const { Schema, model } = require("mongoose");

const ZoneSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  boundary_coords: String, // Stored as string for now, could be GeoJSON in future
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = model("Zone", ZoneSchema);
