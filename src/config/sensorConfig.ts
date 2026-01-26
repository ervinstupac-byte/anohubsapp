// PRIMARY_SENSOR_URL template — replace placeholders with your vendor endpoint and query params
// Example: https://sensors.example.com/api/v1/telemetry?api_key=REPLACE_KEY&asset_id=ASSET_ID&hours=HOURS
export const PRIMARY_SENSOR_URL_TEMPLATE = 'https://<SENSOR_HOST>/api/v1/telemetry?api_key=<API_KEY>&asset_id=<ASSET_ID>&hours=<HOURS>';

export const SENSOR_CONFIG_DOC = `
Place your live sensor endpoint into PRIMARY_SENSOR_URL environment variable.
Use the following template as reference:

  ${PRIMARY_SENSOR_URL_TEMPLATE}

When ready, set env:

  PRIMARY_SENSOR_URL="https://sensors.example.com/api/v1/telemetry?api_key=YOUR_KEY&asset_id=1&hours=24"

The ingest script expects an array of samples or an object with a data array and will upsert into dynamic_sensor_data.
`;

export default { PRIMARY_SENSOR_URL_TEMPLATE, SENSOR_CONFIG_DOC };
