import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the "jwt" cookie exists
  token = req.cookies.jwt;

  if (token) {
    try {
      // 1. Verify the token using your secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 2. Find the user in the DB (exclude the password)
      // and attach it to the request object
      req.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

export { protect };