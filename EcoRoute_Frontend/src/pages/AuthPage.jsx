import React, { useState } from "react";
import api from "../api/api";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

/**
 * NOTES:
 * - Backend endpoints used:
 * POST /auth/register   { username, password, email, role, companyName, companySector }
 * POST /auth/login      { username, password } -> { token }
 */

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // common form state
  const [form, setForm] = useState({
    userid: "",
    password: "",
    email: "",
    role: "client", // Default to client
    companyName: "",
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
        const res = await api.post("/auth/login", {
          userid: form.userid,
          password: form.password,
        });

        const token = res.data.token || res.data?.accessToken || null;
        if (!token) {
          mockLoginFallback();
          return;
        }
        localStorage.setItem("ecoroute_token", token);
        const payload = jwtDecode(token);
        redirectByRole(payload.role);
      } else {
        // SIGNUP
        await api.post("/auth/signup", {
          userid: form.userid,
          password: form.password,
          email: form.email,
          role: form.role,
          companyName : form.companyName,
          // If admin, send empty sector or fixed value depending on backend needs
          companySector : form.role === 'admin' ? "" : form.companySector
        });
        
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

  const redirectByRole = (role) => {
    if (role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/client-dashboard");
    }
  };

  const mockLoginFallback = () => {
    // Keep fallback for UI testing if backend fails
    const fakeRole = form.userid === "admin" ? "admin" : "client";
    navigate("/client-dashboard");
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
          
          {/* 1. Role Selection (Moved to Top) */}
          {!isLogin && (
            <label className="label">
              Role
              <select name="role" value={form.role} onChange={onChange}>
                <option value="client">Client</option> {/* 2. Renamed User to Client */}
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          <label className="label">
            User Id
            <input
              name="userid"
              value={form.userid}
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
                {/* 6. Company Name: Dropdown for Admin, Text for Client */}
                <label className="label">
                    Company Name
                    {form.role === 'admin' ? (
                        <select 
                            name="companyName"
                            value={form.companyName}
                            onChange={onChange}
                            required
                        >
                            <option value="" disabled>Select Company</option>
                            <option value="EcoRoute Admin Corp">EcoRoute Admin</option>
                            
                        </select>
                    ) : (
                        <input
                            name="companyName"
                            value={form.companyName}
                            onChange={onChange}
                            required
                            placeholder="Enter your company name"
                        />
                    )}
                </label>

                {/* 4 & 5. Company Sector: Dropdown for Client, Disabled for Admin */}
                <label className="label">
                    Company Sector
                    {form.role === 'client' ? (
                        <select
                            name="companySector"
                            value={form.companySector}
                            onChange={onChange}
                            required
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
                            name="companySector"
                            value="" 
                            disabled
                            placeholder="Not applicable for Admin"
                            style={{backgroundColor: '#f3f4f6', cursor: 'not-allowed', color: '#9ca3af'}}
                        />
                    )}
                </label>
            </>
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

        
      </div>
    </div>
  );
}