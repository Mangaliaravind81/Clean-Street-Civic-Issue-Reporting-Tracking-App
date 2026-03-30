const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  // fetch: customFetchImplementation,
  // apiKey: 'YOUR_API_KEY', // OpenStreetMap/Nominatim doesn't strictly require an API key for low volume
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;
