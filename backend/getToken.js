import axios from "axios";

// 1. CREDENTIALS
const CLIENT_ID = "1000.ASFKOXJ1RLHYC3T0FML1Q856W5W2PR";
const CLIENT_SECRET = "c7d694ccc85eddec9cf83d2d594e8089be8a7eb74b";

// 2. YOUR CODE (Extracted from your URL)
const CODE =
  "1000.a0efba8292c5ef9af523eccf3fa1ff80.1c45c527028c9f65861eb0ba8dd3abba";

const getRefreshToken = async () => {
  try {
    // ⚠️ NOTE: I changed 'zoho.com' to 'zoho.in' because your account is in India.
    const url = `https://accounts.zoho.in/oauth/v2/token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=http://localhost:5000/callback&grant_type=authorization_code&code=${CODE}`;

    const { data } = await axios.post(url);
    console.log("✅ SUCCESS! Here is your Refresh Token:");
    console.log("---------------------------------------");
    console.log(data.refresh_token);
    console.log("---------------------------------------");
  } catch (error) {
    console.error(
      "❌ Error:",
      error.response ? error.response.data : error.message
    );
  }
};

getRefreshToken();
