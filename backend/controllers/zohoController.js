import axios from "axios";
import { getZohoAccessToken } from "../utils/zohoAuth.js";
import { transformDataForZoho } from "../utils/dataTransformer.js";

const ZOHO_MODULE = "Leads";

export const createZohoEntry = async (req, res) => {
  try {
    console.log("📥 Raw Data from React:", req.body);

    // 1. TRANSFORM: Clean and calculate the data
    const processedData = transformDataForZoho(req.body);
    console.log("✨ Transformed Data:", processedData);

    // 2. AUTH: Get a fresh, valid token
    const token = await getZohoAccessToken();

    // 3. SEND: Post to Zoho CRM API
    const response = await axios.post(
      `${process.env.ZOHO_API_DOMAIN}/crm/v2/${ZOHO_MODULE}`,
      { data: [processedData] },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = response.data.data[0];

    if (result.status === "success") {
      res.status(201).json({
        success: true,
        zohoId: result.details.id,
        transformedData: processedData,
      });
    } else {
      throw new Error(JSON.stringify(result));
    }
  } catch (error) {
    console.error("❌ Zoho API Error:", error.response?.data || error.message);
    res
      .status(500)
      .json({ error: "Integration Failed", details: error.message });
  }
};
