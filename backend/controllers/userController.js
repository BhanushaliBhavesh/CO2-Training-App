import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import axios from "axios";

// ✅ Import Helper Functions
import { transformDataForZoho } from "../utils/dataTransformer.js";
import { getZohoAccessToken } from "../utils/zohoAuth.js";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({
      _id: user._id,
      name: user.name,
      surname: user.surname, // Send surname back too
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user & Sync to Zoho
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  // 1. Get Split Data (Middleware has already split 'name' and added 'surname')
  const { name, surname, email, password, city, birthYear } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // 2. ✨ TRANSFORM DATA (Calculate Age, State, Country)
  const rawInput = { fullName: `${name} ${surname}`, email, city, birthYear };
  const enrichedData = transformDataForZoho(rawInput);

  // ⚡ EXPLICITLY OVERRIDE NAME FIELDS FOR ZOHO
  // This ensures Zoho gets "Jatin" in First Name and "Sinha" in Last Name
  enrichedData.First_Name = name;
  enrichedData.Last_Name = surname;

  // 3. 💾 SAVE TO MONGODB (With Enriched Data)
  const user = await User.create({
    name, // "Jatin"
    surname, // "Sinha"
    email,
    password,
    city,
    birthYear,
    // Save the smart fields:
    state: enrichedData.State,
    country: enrichedData.Country,
    age: enrichedData.Annual_Revenue, // Mapping 'Annual_Revenue' back to 'age'
  });

  if (user) {
    // 4. ☁️ BACKGROUND SYNC TO ZOHO CRM
    saveToZoho(enrichedData).catch((err) =>
      console.error("⚠️ Zoho Sync Failed:", err.message)
    );

    // 5. Respond to Frontend
    generateToken(res, user._id);
    res.status(201).json({
      _id: user._id,
      name: user.name,
      surname: user.surname, // ✅ Return Surname
      email: user.email,
      city: user.city,
      state: user.state,
      country: user.country,
      age: user.age,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// --- HELPER: Zoho Sync Logic ---
const saveToZoho = async (data) => {
  const token = await getZohoAccessToken();
  await axios.post(
    `${process.env.ZOHO_API_DOMAIN}/crm/v2/Leads`,
    { data: [data] },
    {
      headers: { Authorization: `Zoho-oauthtoken ${token}` },
    }
  );
  console.log("✅ New User Synced to Zoho CRM Leads");
};

export { authUser, registerUser, logoutUser };
