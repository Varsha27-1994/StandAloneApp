// config/zoom.js
const axios = require("axios");
const qs = require("querystring");

// Get Zoom OAuth access token
const getZoomAccessToken = async () => {
  try {
    const auth = Buffer.from(
      `${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`
    ).toString("base64");

    const response = await axios.post(
      "https://zoom.us/oauth/token",
      qs.stringify({
        grant_type: "account_credentials",
        account_id: process.env.ZOOM_ACCOUNT_ID,
      }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return response.data.access_token;
  } catch (error) {
    console.error(
      "Error getting Zoom access token:",
      error.response?.data || error.message
    );
    throw new Error("Failed to get Zoom access token");
  }
};

module.exports = {
  getZoomAccessToken,
};
