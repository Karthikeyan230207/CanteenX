import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import "../SignIn/Auth.css";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    registerNumber: "",
    username: "",
    department: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================
  // SIGN UP
  // =========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const {
      registerNumber,
      username,
      department,
      password,
      confirmPassword,
    } = formData;

    // Basic validation
    if (
      !registerNumber ||
      !username ||
      !department ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://smart-canteen-system-pyyl.onrender.com/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            registerNumber,
            username,
            department,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setSuccess("Account created successfully! Redirecting to login...");

      // Clear form
      setFormData({
        registerNumber: "",
        username: "",
        department: "",
        password: "",
        confirmPassword: "",
      });

      // Go to signin after short delay
      setTimeout(() => {
        navigate("/signin");
      }, 1200);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo-badge" aria-hidden="true"><UtensilsCrossed size={25} /></div>

        <h1 className="auth-title">canteenX</h1>
        <p className="auth-subtitle">Smart Canteen</p>

        <h2 className="auth-heading">Create Account</h2>
        <p className="auth-description">Register to pre-order food easily</p>

        {/* Error */}
        {error && <div className="auth-alert-error">{error}</div>}

        {/* Success */}
        {success && <div className="auth-alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Register Number */}
          <div className="auth-field">
            <label htmlFor="signup-register-number">Register Number</label>
            <input
              id="signup-register-number"
              type="text"
              name="registerNumber"
              placeholder="Example: 23CS101"
              value={formData.registerNumber}
              onChange={handleChange}
              className="auth-input"
              autoComplete="username"
            />
          </div>

          {/* Username */}
          <div className="auth-field">
            <label htmlFor="signup-username">Full Name</label>
            <input
              id="signup-username"
              type="text"
              name="username"
              placeholder="Enter your name"
              value={formData.username}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          {/* Department */}
          <div className="auth-field">
            <label htmlFor="signup-department">Department</label>
            <input
              id="signup-department"
              type="text"
              name="department"
              placeholder="Example: CSE"
              value={formData.department}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              type="password"
              name="password"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="auth-input"
              autoComplete="new-password"
            />
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="auth-submit-btn"
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        {/* Sign In */}
        <p className="auth-switch-text">
          Already have an account?
          <Link to="/signin" className="auth-switch-link">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #fff7ed, #fef3c7)",
    padding: "20px",
    fontFamily:
      "Arial, Helvetica, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "420px",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "40px",
    boxShadow:
      "0 15px 40px rgba(0,0,0,0.12)",
  },

  logo: {
    width: "60px",
    height: "60px",
    margin: "0 auto 8px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff7ed",
    fontSize: "28px",
  },

  title: {
    textAlign: "center",
    margin: "0",
    fontSize: "30px",
    fontWeight: "700",
  },

  subtitle: {
    textAlign: "center",
    marginTop: "5px",
    color: "#777",
    fontSize: "14px",
  },

  heading: {
    marginTop: "25px",
    marginBottom: "5px",
    fontSize: "24px",
  },

  description: {
    color: "#777",
    marginTop: "0",
    marginBottom: "22px",
  },

  field: {
    marginBottom: "15px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "14px",
    fontWeight: "600",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 14px",
    border: "1px solid #ddd",
    borderRadius: "10px",
    fontSize: "15px",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#f97316",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "5px",
  },

  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "11px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px",
  },

  success: {
    background: "#dcfce7",
    color: "#15803d",
    padding: "11px",
    borderRadius: "8px",
    marginBottom: "15px",
    fontSize: "14px",
  },

  signinText: {
    textAlign: "center",
    marginTop: "22px",
    color: "#666",
    fontSize: "14px",
  },

  link: {
    color: "#f97316",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default SignUp;