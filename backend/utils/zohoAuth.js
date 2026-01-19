import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

let accessToken = null;
let tokenExpiresAt = 0;

export const getZohoAccessToken = async () => {
  const now = Date.now();

  // 1. CHECK: Is the current token still valid? (We give it a 1-minute buffer)
  if (accessToken && now < tokenExpiresAt - 60000) {
    return accessToken; // Use the existing one!
  }

  console.log("🔄 Token expired. Refreshing Zoho Access Token...");

  try {
    // 2. ACTION: Ask Zoho for a new token using the Refresh Token from .env
    // Note: We use the India (.in) account server
    const response = await axios.post(
      "https://accounts.zoho.in/oauth/v2/token",
      null,
      {
        params: {
          refresh_token: process.env.ZOHO_REFRESH_TOKEN,
          client_id: process.env.ZOHO_CLIENT_ID,
          client_secret: process.env.ZOHO_CLIENT_SECRET,
          grant_type: "refresh_token",
        },
      }
    );

    // 3. SAVE: Store the new token and its expiry time
    accessToken = response.data.access_token;
    tokenExpiresAt = now + response.data.expires_in * 1000;

    return accessToken;
  } catch (error) {
    console.error("❌ Auth Error:", error.response?.data || error.message);
    throw new Error("Zoho Authentication Failed");
  }
};
