import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import { useAuth } from "../../Context/AuthContext";
import "./Auth.css";

const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_APP_URL || "https://canteenxadmin.vercel.app";

function signInAdmin(email, password) {
  const adminOrigin = new URL(ADMIN_APP_URL).origin;

  return new Promise((resolve, reject) => {
    let portalWindow;
    let portalReady = false;
    let session = null;
    let settled = false;

    const cleanup = () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("message", handleMessage);
    };

    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      cleanup();
      callback(value);
    };

    const sendSession = () => {
      if (!portalReady || !session || !portalWindow) return;
      portalWindow.postMessage(
        { type: "ADMIN_AUTH_SESSION", ...session },
        adminOrigin
      );
    };

    const handleMessage = (event) => {
      if (event.origin !== adminOrigin || event.source !== portalWindow) return;

      if (event.data?.type === "ADMIN_AUTH_READY") {
        portalReady = true;
        sendSession();
      }

      if (event.data?.type === "ADMIN_AUTH_ACCEPTED") {
        portalWindow?.close();
        finish(resolve);
      }
    };

    const timeoutId = window.setTimeout(() => {
      portalWindow?.close();
      finish(reject, new Error("Admin portal connection timed out. Please try again."));
    }, 15000);

    window.addEventListener("message", handleMessage);
    portalWindow = window.open(`${ADMIN_APP_URL}/auth/receive`, "_blank");

    if (!portalWindow) {
      finish(reject, new Error("Allow pop-ups to open the admin portal."));
      return;
    }

    fetch("https://smart-canteen-system-pyyl.onrender.com/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Admin login failed");
        }
        if (!data.token || data.admin?.role !== "admin") {
          throw new Error("The server returned an invalid admin session.");
        }
        return data;
      })
      .then((data) => {
        session = { token: data.token, admin: data.admin };
        sendSession();
      })
      .catch((error) => {
        portalWindow?.close();
        finish(reject, error);
      });
  });
}

function SignIn() {
  const navigate = useNavigate();
  const { signin } = useAuth();
  const [loginType, setLoginType] = useState("student");
  const [registerNumber, setRegisterNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setError("");
    setPassword("");
    setRegisterNumber("");
    setEmail("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (loginType === "student" && (!registerNumber.trim() || !password)) {
      setError("Please enter register number and password");
      return;
    }

    if (loginType === "admin" && (!email.trim() || !password)) {
      setError("Please enter admin email and password");
      return;
    }

    try {
      setLoading(true);

      if (loginType === "student") {
        await signin(registerNumber.trim(), password);
        navigate("/");
        return;
      }

      await signInAdmin(email, password);
      window.location.assign(new URL("/reports", ADMIN_APP_URL).href);
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError(loginError.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo-badge" aria-hidden="true"><UtensilsCrossed size={25} /></div>
        <h1 className="auth-title">canteenX</h1>
        <p className="auth-subtitle">Smart Canteen</p>
        <h2 className="auth-heading">Welcome back</h2>
        <p className="auth-description">Sign in to continue to your canteen portal.</p>


        {error && <div className="auth-alert-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit}>
          {loginType === "student" ? (
            <div className="auth-field">
              <label htmlFor="register-number">Register Number</label>
              <input
                id="register-number"
                className="auth-input"
                type="text"
                placeholder="Example: 23CS101"
                autoComplete="username"
                value={registerNumber}
                onChange={(event) => setRegisterNumber(event.target.value)}
              />
            </div>
          ) : (
            <div className="auth-field">
              <label htmlFor="admin-email">Admin Email</label>
              <input
                id="admin-email"
                className="auth-input"
                type="email"
                placeholder="admin@canteen.com"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="account-password">Password</label>
            <input
              id="account-password"
              className="auth-input"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <button className="auth-submit-btn" type="submit" disabled={loading}>
            {loading
              ? loginType === "admin" ? "Connecting to Admin Portal..." : "Signing in..."
              : loginType === "student" ? "Student Sign In" : "Admin Sign In"}
          </button>
        </form>

        {loginType === "student" && (
          <p className="auth-switch-text">
            Don't have an account? <Link to="/signup" className="auth-switch-link">Sign up</Link>
          </p>
        )}
      </section>
    </main>
  );
}

export default SignIn;