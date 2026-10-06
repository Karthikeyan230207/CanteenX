import { useAdminAuth } from "../context/AdminAuthContext";

function Header({
  title = "Dashboard",
  subtitle = "Welcome back, Admin 👋",
}) {
  const { admin } = useAdminAuth();

  const adminName = admin?.name || "Admin Manager";
  const adminEmail = admin?.email || "Canteen Operations";
  const avatarLetter = adminName.charAt(0).toUpperCase();

  return (
    <header className="admin-header">

      {/* Page Title */}
      <div className="admin-header-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {/* Right Section */}
      <div className="admin-profile">

        {/* Notification */}
        <div
          className="notification"
          title="System Notifications"
        >
          🔔
          <span className="notification-dot"></span>
        </div>

        {/* Avatar */}
        <div
          className="profile-avatar"
          title={admin?.email || "Admin"}
        >
          {avatarLetter}
        </div>

        {/* Profile Info */}
        <div className="profile-info">
          <strong>{adminName}</strong>
          <span>{adminEmail}</span>
        </div>

      </div>

    </header>
  );
}

export default Header;