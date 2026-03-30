const axios = require("axios");

async function checkApi() {
  try {
    const res = await axios.get("http://localhost:5000/complaints");
    const complaint = res.data.complaints[0];
    console.log("Complaint keys from API:", Object.keys(complaint));
    console.log("created_at:", complaint.created_at);
    console.log("createdAt:", complaint.createdAt);
  } catch (err) {
    console.error("API call failed. Is the server running?", err.message);
  }
}

checkApi();
