import React, { useState } from "react";
import api from "../api/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

/**
 * NOTES:
 * - Replace 'public/ups-logo.png' with your UPS logo in the public folder.
 * - Backend endpoints used:
 *    POST /auth/register   { username, password, email, role }
 *    POST /auth/login      { username, password } -> { token }
 * - Token payload must include 'role' claim (e.g., { sub: 'alice', role: 'user' })
 */

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // common form state
  const [form, setForm] = useState({
    userid: "",      // Changed from username
    password: "",
    email: "",
    role: "user",
    companyName: "", // Added
    companySector: ""
  });

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        const res = await api.post("api/auth/login", {
          userid: form.userid,
          password: form.password,
        });

        const token = res.data.token || res.data?.accessToken || null;
        if (!token) {
          // Mock fallback (if backend not ready) - this is only for UI testing:
          mockLoginFallback();
          return;
        }
        localStorage.setItem("ecoroute_token", token);
        const payload = jwtDecode(token);
        redirectByRole(payload.role);
      } else {
        // SIGNUP
        await api.post("api/auth/signup", {
          userid: form.userid,
          password: form.password,
          email: form.email,
          role: form.role,
          companyName : form.companyName,
          companySector : form.companySector
        });
        // After register, switch to login
        setIsLogin(true);
        setForm({ ...form, password: "" });
        setError("Registration successful — please log in.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.message ||
          err?.response?.data ||
          err.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  // // Mock fallback for UI when backend isn't available (remove when API is ready)
  // const mockLoginFallback = () => {
  //   // create a fake token payload; production tokens must be secure!
  //   const fakeRole = form.username === "admin" ? "admin" : "user";
  //   const fakePayload = { sub: form.username, role: fakeRole, exp: 9999999999 };
  //   const fakeToken = btoa(JSON.stringify({ alg: "none" })) + "." + btoa(JSON.stringify(fakePayload)) + ".";
  //   localStorage.setItem("ecoroute_token", fakeToken);
  //   redirectByRole(fakeRole);
  // };

  const redirectByRole = (role) => {
    if (role === "admin") navigate("/admin");
    else navigate("/dashboard");
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="hero-title">
          <h1 className="brand-title">EcoRoute</h1>
            <p className="brand-subtitle">
              Measure, Manage, and Minimize your Logistics Carbon Footprint
            </p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(true);
              setError("");
            }}
          >
            Login
          </button>
          <button
            className={`tab ${!isLogin ? "active" : ""}`}
            onClick={() => {
              setIsLogin(false);
              setError("");
            }}
          >
            Signup
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label className="label">
            User Id
            <input
              name="userid"        // ⚠️ MUST match the state key exactly
              value={form.userid}  // ⚠️ Update this too
              onChange={onChange}
              required
              placeholder="e.g., type user id..."
            />
          </label>

          {!isLogin && (
            <label className="label">
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
                placeholder="you@ups.com"
              />
            </label>
          )}

          <label className="label">
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
              placeholder="Enter a secure password"
            />
          </label>

          {!isLogin && (
          <>
                <label className="label">
                    Company Name
                    <input
                        name="companyName"
                        value={form.companyName}
                        onChange={onChange}
                        required
                        placeholder="comp1"
                    />
                </label>

                <label className="label">
                    Company Sector
                    <input
                        name="companySector"
                        value={form.companySector}
                        onChange={onChange}
                        required
                        placeholder="e.g., Logistics, Retail"
                    />
                </label>
            </>
        )}

          {!isLogin && (
            <label className="label">
              Role
              <select name="role" value={form.role} onChange={onChange}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          {error && <div className="error">{error}</div>}

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Create account"}
          </button>

          <div className="helper">
            {isLogin ? (
              <span>
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="link"
                  onClick={() => setIsLogin(false)}
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already signed up?{" "}
                <button
                  type="button"
                  className="link"
                  onClick={() => setIsLogin(true)}
                >
                  Login
                </button>
              </span>
            )}
          </div>
        </form>

        <div className="note">
          <strong>Tip:</strong> For quick admin access during testing use username
          <code>admin</code>.
        </div>
      </div>
    </div>
  );
}
