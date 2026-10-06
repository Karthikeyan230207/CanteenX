import { NavLink } from "react-router-dom";
import { ChartColumnIncreasing, ClipboardList, LayoutDashboard, LogOut, UtensilsCrossed } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const STUDENT_APP_ORIGIN =
  import.meta.env.VITE_STUDENT_APP_ORIGIN || "http://localhost:5173";

function Sidebar() {
  const { logout } = useAdminAuth();

  const handleSignOut = () => {
    logout();
    window.location.assign(new URL("/signin", STUDENT_APP_ORIGIN).href);
  };

  return (
    <aside className="admin-sidebar" aria-label="Admin Navigation">
      <div className="sidebar-logo">
        <div className="logo-icon"><UtensilsCrossed size={20} aria-hidden="true" /></div>
        <div className="logo-text">
          <h2>canteenX</h2>
          <span>Admin Portal</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          title="Dashboard"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon"><LayoutDashboard size={19} aria-hidden="true" /></span>
          <span className="nav-label">Dashboard</span>
        </NavLink>

        <NavLink
          to="/food"
          title="Food Management"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon"><UtensilsCrossed size={19} aria-hidden="true" /></span>
          <span className="nav-label">Food Management</span>
        </NavLink>

        <NavLink
          to="/orders"
          title="Order Management"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon"><ClipboardList size={19} aria-hidden="true" /></span>
          <span className="nav-label">Order Management</span>
        </NavLink>

        <NavLink
          to="/reports"
          title="Sales Reports"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon"><ChartColumnIncreasing size={19} aria-hidden="true" /></span>
          <span className="nav-label">Sales Reports</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button
          type="button"
          className="logout-btn"
          onClick={handleSignOut}
          title="Sign out of Admin Portal"
        >
          <span className="nav-icon"><LogOut size={19} aria-hidden="true" /></span>
          <span className="nav-label">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;