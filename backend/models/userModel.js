import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    // ✅ NEW FIELD
    surname: { type: String, required: true, default: "." },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // ✅ RAW INPUTS (From Frontend)
    city: { type: String, required: false },
    birthYear: { type: Number, required: false },

    // ✅ ENRICHED DATA (Calculated by Node.js)
    state: { type: String, required: false },
    country: { type: String, required: false },
    age: { type: Number, required: false },
  },
  { timestamps: true }
);

// Encrypt password using bcrypt before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
