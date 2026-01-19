import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../slices/usersapiSlice";
import { setCredentials } from "../slices/authSlice";
import PhoneFrame from "../components/PhoneFrame";
import BreathingButton from "../components/BreathingButton"; // ✅ Import

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) navigate("/");
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (err) {
      alert(err?.data?.message || err.error);
    }
  };

  return (
    <PhoneFrame>
      <div className="h-full flex flex-col justify-center p-8 bg-white">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Welcome Back</h1>
          <p className="text-slate-500">Sign in to continue your training.</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-slate-800 font-medium"
            />
          </div>

          {/* ✅ BREATHING LOGIN BUTTON */}
          <BreathingButton
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 active:scale-95 transition-transform mt-6"
            fillColor="rgb(99, 102, 241)" // Indigo Air
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </BreathingButton>
        </form>

        <p className="text-center mt-8 text-slate-500">
          New here?{" "}
          <Link
            to="/register"
            className="text-indigo-600 font-bold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>
    </PhoneFrame>
  );
};

export default LoginPage;
