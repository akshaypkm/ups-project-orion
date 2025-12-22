import React, { useState } from "react";
import api from "../api/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  //password regex: at least 6 characters, one uppercase, one lowercase, one number, one special character
  const validatePassword = (password) => {
    return (
      password.length >= 6 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };


  const [form, setForm] = useState({
    userid: "",
    password: "",
    email: "",
    role: "client",
    companyName: "",
    companySector: "",
  });

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const redirectByRole = (role) => {
    role === "admin"
      ? navigate("/admin-dashboard")
      : navigate("/client-dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        const res = await api.post("api/auth/login", {
          userid: form.userid,
          password: form.password,
        });

        const token = res.data.token || res.data?.accessToken;
        if (!token) throw new Error("Token not received");

        localStorage.setItem("ecoroute_token", token);
        const payload = jwtDecode(token);
        redirectByRole(payload.role);
      } else {
        if (!validatePassword(form.password)) {
          setError(
            "Password must be at least 6 characters and include uppercase, lowercase, number, and special character"
          );
          setLoading(false);
          return;
        }
        await api.post("api/auth/signup", {
          userid: form.userid,
          password: form.password,
          email: form.email,
          role: form.role,
          companyName: form.companyName,
          companySector: form.role === "admin" ? "" : form.companySector,
        });

        setIsLogin(true);
        setForm((s) => ({ ...s, password: "" }));
        setError("Registration successful. Please login.");
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };
  const sendOtp = async () => {
    if (!form.email) {
      setError("Please enter email first");
      return;
    }
    try {
      setOtpLoading(true);
      await api.post("api/auth/send-otp", {
        email: form.email,
      });
      setOtpSent(true);
      setError("OTP sent to your email");
    } catch (err) {
      setError(err?.response?.data || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };
const verifyOtp = async () => {
  try {
    setOtpLoading(true);
    await api.post("api/auth/verify-otp", {
      email: form.email,
      otp: otp,
    });
    setEmailVerified(true);
    setError("Email verified successfully");
  } catch (err) {
    setError(err?.response?.data || "Invalid OTP");
  } finally {
    setOtpLoading(false);
  }
};


  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[2.5fr_1.5fr] font-sans">

      {/* LEFT BRAND PANEL */}
      <div className="hidden md:flex relative overflow-hidden flex-col items-center justify-center
        bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600 text-white p-20">

        {/* SVG PATTERN (ADDED) */}
{/* ECO LOGISTICS CONTINUOUS PATTERN */}
<svg
  className="absolute inset-0 w-full h-full opacity-25"
  xmlns="http://www.w3.org/2000/svg"
>
  <defs>
    <pattern
      id="ecoLogistics"
      patternUnits="userSpaceOnUse"
      width="160"
      height="160"
    >
      <g
        stroke="rgba(0,70,40,0.55)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Truck */}
        <rect x="10" y="20" width="36" height="16" rx="3" />
        <rect x="46" y="24" width="14" height="12" rx="2" />
        <circle cx="22" cy="38" r="3" />
        <circle cx="42" cy="38" r="3" />

        {/* Ship */}
        <path d="M90 30 L120 30 L130 42 L80 42 Z" />
        <path d="M85 46 Q105 52 125 46" />

        {/* Aeroplane */}
        <path d="M60 80 L120 74 L60 68 L64 80 Z" />
        <line x1="78" y1="80" x2="78" y2="60" />
        <line x1="78" y1="80" x2="78" y2="100" />

        {/* Leaf */}
        <path d="M20 90 C30 80, 50 90, 40 110 C30 130, 10 110, 20 90" />
        <line x1="30" y1="96" x2="30" y2="115" />

        {/* Earth */}
        <circle cx="120" cy="110" r="10" />
        <path d="M110 110 C115 104, 125 116, 130 110" />

        {/* Water */}
        <path d="M20 130 Q30 120 40 130 T60 130" />
        <path d="M70 130 Q80 120 90 130 T110 130" />
      </g>
    </pattern>
  </defs>

  <rect width="100%" height="100%" fill="url(#ecoLogistics)" />
</svg>


        <div className="absolute top-0 left-0 w-full flex flex-col items-center z-10 pt-24">
          <h1 className="text-9xl font-extrabold tracking-wide mb-6">
            EcoRoute
          </h1>
          <p className="text-3xl opacity-90 text-center max-w-md">
            Your Companion for Low-Carbon Travel Decisions
          </p>
        </div>
      </div>

      {/* RIGHT AUTH PANEL */}
      <div className="relative flex justify-center items-center bg-gray-50 px-6 md:px-10">
        <div
          className={`relative w-full max-w-3xl bg-white/70 backdrop-blur-xl
          rounded-3xl shadow-2xl border border-white/30
          ${isLogin ? "p-10" : "p-10"}`}   // ONLY padding reduced for signup
        >

          {/* TABS */}
          <div className="flex mb-6 border-b">
            <button
              className={`flex-1 py-3 text-xl font-bold ${
                isLogin
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-400"
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 text-xl font-bold ${
                !isLogin
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-400"
              }`}
              onClick={() => setIsLogin(false)}
            >
              Signup
            </button>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-${isLogin ? "6" : "4"}`} // tighter spacing for signup
          >

            {!isLogin && (
              <div>
                <label className="block font-semibold mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={onChange}
                  className="w-full border rounded-xl px-1 py-3"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1">User ID</label>
              <input
                name="userid"
                value={form.userid}
                onChange={onChange}
                required
                className="w-full border rounded-xl px-5 py-3"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={(e) => {
                    onChange(e);
                    setOtpSent(false);
                    setEmailVerified(false);
                    setOtp("");
                  }}
                  required
                  className="w-full border rounded-xl px-5 py-3"
                />
              </div>
            )}
            {!emailVerified && form.email && (
              <button
              type="button"
              onClick={sendOtp}
              disabled={otpLoading}
              className="mt-2 text-sm text-green-600 font-semibold hover:underline">
                {otpSent ? "Resend OTP" : "Verify Email"}
                </button>
            )}
            {otpSent && !emailVerified && (
              <div className="mt-3 space-y-2">
                <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border rounded-xl px-5 py-3"/>
              <button
              type="button"
              onClick={verifyOtp}
              disabled={otpLoading}
              className="w-full bg-green-600 text-white py-2 rounded-xl font-semibold">Verify OTP</button>
              </div>
            )}
            {emailVerified && (
              <p className="text-green-600 text-sm font-semibold mt-2">
                ✅ Email verified
                </p>
            )}

            <div>
              <label className="block font-semibold mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                required
                className="w-full border rounded-xl px-5 py-3"
              />
            </div>
            {!isLogin && form.password && !validatePassword(form.password) && (
              <p className="text-sm text-red-500 mt-1">
                Password must contain 6+ characters, uppercase, lowercase, number & special character</p>
              )}

            {!isLogin && (
              <div>
                <label className="block font-semibold mb-1">Company Name</label>
                {form.role === "admin" ? (
                  <select
                    name="companyName"
                    value={form.companyName}
                    onChange={onChange}
                    required
                    className="w-full border rounded-xl px-5 py-3"
                  >
                    <option value="">Select Company</option>
                    <option value="EcoRoute Admin Corp">EcoRoute Admin</option>
                  </select>
                ) : (
                  <input
                    name="companyName"
                    value={form.companyName}
                    onChange={onChange}
                    required
                    className="w-full border rounded-xl px-5 py-3"
                  />
                )}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block font-semibold mb-1">Company Sector</label>
                {form.role === "client" ? (
                  <select
                    name="companySector"
                    value={form.companySector}
                    onChange={onChange}
                    required
                    className="w-full border rounded-xl px-5 py-3"
                  >
                    <option value="" disabled>Select Sector</option>
                    <option value="Cement Industry">Cement Industry</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Solid Fuel Manufacturing">Solid Fuel Manufacturing</option>
                    <option value="Industrial Engineering">Industrial Engineering</option>
                    <option value="Pulp and Paper Industries">Pulp and Paper Industries</option>
                    <option value="Brick Manufacturing">Brick Manufacturing</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Iron and Steel">Iron and Steel</option>
                  </select>
                ) : (
                  <input
                    disabled
                    placeholder="Not applicable for Admin"
                    className="w-full border rounded-xl px-5 py-3 bg-gray-100"
                  />
                )}
              </div>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-xl">
                {error}
              </div>
            )}
             {/* ✅ FORGOT PASSWORD (LOGIN ONLY) */}
            {isLogin && (
              <div className="text-right text-sm">
                <button
                  type="button"
                  className="text-green-600 hover:underline"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </button>
              </div>
            )}


            <button
            type="submit"
            disabled={loading || (!isLogin && !emailVerified)}
            className={`w-full py-3 rounded-xl text-xl font-bold ${
              !isLogin && !emailVerified
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600 text-white"
              }`}
            >
              {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </button>
            {/* ✅ LOGIN ↔ SIGNUP REDIRECT */}
            {isLogin ? (
              <div className="text-center text-sm">
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="text-green-600 font-semibold hover:underline"
                  onClick={() => setIsLogin(false)}
                >
                  Sign up
                </button>
              </div>
            ) : (
              <div className="text-center text-sm">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-green-600 font-semibold hover:underline"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
