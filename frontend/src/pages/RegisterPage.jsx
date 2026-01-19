import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation } from "../slices/usersapiSlice";
import { setCredentials } from "../slices/authSlice";
import PhoneFrame from "../components/PhoneFrame";
import BreathingButton from "../components/BreathingButton";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate("/");
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // 1. Check for Empty Fields (Manual Validation)
    if (
      !name ||
      !email ||
      !city ||
      !birthYear ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all fields. All details are required.");
      return;
    }

    // 2. Check Password Match
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // 3. Attempt Registration
    try {
      const res = await register({
        name,
        email,
        password,
        city,
        birthYear,
      }).unwrap();

      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (err) {
      // 4. Handle Backend Errors
      alert(err?.data?.message || err.error);
    }
  };

  return (
    <PhoneFrame>
      <div className="h-full flex flex-col justify-center p-8 bg-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Create Account</h1>
          <p className="text-slate-500">
            Please enter your details to register.
          </p>
        </div>

        <form onSubmit={submitHandler} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              required // ✅ HTML Validation
              onChange={(e) => setName(e.target.value)}
              // REMOVED: invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              required // ✅ HTML Validation
              onChange={(e) => setEmail(e.target.value)}
              // REMOVED: invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium"
            />
          </div>

          {/* City & Year Grid */}
          <div className="flex gap-4">
            <div className="w-1/2 space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Mumbai"
                value={city}
                required // ✅ HTML Validation
                onChange={(e) => setCity(e.target.value)}
                // REMOVED: invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium"
              />
            </div>
            <div className="w-1/2 space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Birth Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="1998"
                value={birthYear}
                required // ✅ HTML Validation
                onChange={(e) => setBirthYear(e.target.value)}
                // REMOVED: invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              required // ✅ HTML Validation
              onChange={(e) => setPassword(e.target.value)}
              // REMOVED: invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              required // ✅ HTML Validation
              onChange={(e) => setConfirmPassword(e.target.value)}
              // REMOVED: invalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium"
            />
          </div>

          <BreathingButton
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-200 active:scale-95 transition-transform mt-6"
            fillColor="rgb(129, 140, 248)"
          >
            {isLoading ? "Creating Account..." : "Register"}
          </BreathingButton>
        </form>

        <p className="text-center mt-8 text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-indigo-600 font-bold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
};

export default RegisterPage;
