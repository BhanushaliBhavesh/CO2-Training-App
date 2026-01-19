import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.cookie("jwt", token, {
    httpOnly: true,
    // Use secure: true in production (HTTPS), false in dev (HTTP)
    secure: process.env.NODE_ENV === "production",
    // Must be 'None' for cross-site (Vercel->Render) cookies
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

export default generateToken;
