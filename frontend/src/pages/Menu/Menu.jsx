import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Menu.css";

import FoodCard from "../../components/FoodCard/FoodCard";
import SearchBar from "../../components/SearchBar/SearchBar";
import CategoryFilter from "../../components/CategoryFilter/CategoryFilter";
import StickyCart from "../../components/StickyCart/StickyCart";
import VoiceAssistant from "../../components/VoiceAssistant/VoiceAssistant";
import { ClipboardList, Clock3, LogOut, Soup, Utensils, UserRound } from "lucide-react";

import { useAuth } from "../../Context/AuthContext";

function Menu() {
  const navigate = useNavigate();

  const [menu, setMenu] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showProfile, setShowProfile] = useState(false);

  const {
    student,
    updateProfile,
    logout,
  } = useAuth();

  // =========================
  // PROFILE STATE
  // =========================

  const [username, setUsername] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  const [profileMessage, setProfileMessage] =
    useState("");

  const [profileError, setProfileError] =
    useState("");

  const [savingProfile, setSavingProfile] =
    useState(false);

  // =========================
  // OPEN PROFILE
  // =========================

  const openProfile = () => {
    if (student) {
      setUsername(student.username || "");
      setDepartment(student.department || "");
      setPassword("");
    }

    setProfileMessage("");
    setProfileError("");
    setShowProfile(true);
  };

  // =========================
  // UPDATE PROFILE
  // =========================

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!username.trim()) {
      setProfileError("Username cannot be empty");
      return;
    }

    if (!department.trim()) {
      setProfileError("Department cannot be empty");
      return;
    }

    if (password && password.length < 6) {
      setProfileError(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      setSavingProfile(true);

      const profileData = {
        username: username.trim(),
        department: department.trim(),
      };

      if (password.trim()) {
        profileData.password = password;
      }

      await updateProfile(profileData);

      setPassword("");

      setProfileMessage(
        "Profile updated successfully!"
      );
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setProfileError(
        error.message ||
          "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    await logout();
  };

  // =========================
  // FETCH FOODS
  // =========================

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch(
          "https://smart-canteen-system-pyyl.onrender.com/api/foods"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch foods"
          );
        }

        const data = await response.json();

        setMenu(
          Array.isArray(data)
            ? data
            : data.foods || []
        );
      } catch (error) {
        console.error(
          "Failed to load foods:",
          error
        );

        setError("Unable to load menu");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();

    const interval = setInterval(fetchFoods, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // =========================
  // FILTER MENU
  // =========================

  const filteredMenu = menu.filter(
    (item) => {
      const matchesSearch =
        item.name
          ?.toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesCategory =
        selectedCategory === "All" ||
        item.category ===
          selectedCategory;

      return (
        matchesSearch &&
        matchesCategory
      );
    }
  );

  // =========================
  // UI
  // =========================

  return (
    <div className="menu-page">

      {/* =========================
          TOP ACTION BUTTONS
      ========================= */}

      <header className="menu-header">
        <div className="brand-lockup">
          <span className="brand-mark"><Utensils size={19} aria-hidden="true" /></span>
          <div>
            <div className="brand-name-row">
              <strong>canteenX</strong>
              <span className="live-pill"><span className="live-dot"></span>Live Canteen</span>
            </div>
            <small>Smart Canteen Ordering</small>
          </div>
        </div>

        <nav className="menu-top-actions" aria-label="Account navigation">
          {/* MY ORDERS */}
          <button
            onClick={() => navigate("/my-orders")}
            className="my-orders-button"
            title="View my previous orders"
          >
            <span className="btn-icon"><ClipboardList size={16} aria-hidden="true" /></span>
            <span className="btn-text">My Orders</span>
          </button>

          {/* PROFILE */}
          <button
            onClick={openProfile}
            className="profile-button"
            title="Open account profile"
          >
            <span className="profile-avatar-initial">
              {student?.username ? student.username.charAt(0).toUpperCase() : <UserRound size={16} aria-hidden="true" />}
            </span>
            <span className="btn-text">{student?.username || "Profile"}</span>
          </button>
        </nav>
      </header>

      {/* =========================
          VOICE ASSISTANT
      ========================= */}

      <VoiceAssistant menu={menu} />

      <section className="menu-hero" aria-labelledby="menu-heading">
        <div className="hero-text-wrap">
          <span className="eyebrow">ORDER AHEAD · SKIP THE QUEUE</span>
          <h1 id="menu-heading">
            Fresh hot food, <span className="hero-gradient-text">right on time.</span>
          </h1>
          <p>
            Choose your favourite campus meals, place an instant order, and pick up hot food without waiting in line.
          </p>
        </div>

        <div className="hero-badges-wrap">
          <div className="hero-stat-card">
            <span className="stat-icon"><Soup size={20} aria-hidden="true" /></span>
            <div>
              <span className="stat-label">Today's Selection</span>
              <strong className="stat-number">{menu.length || "—"}</strong>
              <small className="stat-sub">dishes on the menu</small>
            </div>
          </div>

          <div className="hero-stat-card hero-stat-accent">
            <span className="stat-icon"><Clock3 size={20} aria-hidden="true" /></span>
            <div>
              <span className="stat-label">Average Ready Time</span>
              <strong className="stat-number">5-10m</strong>
              <small className="stat-sub">fast pickup counter</small>
            </div>
          </div>
        </div>
      </section>

      <main className="menu-content">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

      <CategoryFilter
        menu={menu}
        selectedCategory={
          selectedCategory
        }
        setSelectedCategory={
          setSelectedCategory
        }
      />

      {!loading && !error && (
        <div className="menu-toolbar" aria-live="polite">
          <div className="menu-toolbar-copy">
            <span className="result-indicator" aria-hidden="true" />
            <strong>{filteredMenu.length} {filteredMenu.length === 1 ? "dish" : "dishes"}</strong>
            <span>available to order</span>
          </div>
          {(searchTerm || selectedCategory !== "All") && (
            <button type="button" className="clear-filters-button" onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}>
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* =========================
          LOADING
      ========================= */}

        {loading && (
          <div className="food-grid food-grid-loading" aria-label="Loading today's menu" aria-busy="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div className="food-skeleton" key={index} aria-hidden="true">
                <div className="skeleton-image" />
                <div className="skeleton-lines">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            ))}
          </div>
        )}

      {/* =========================
          ERROR
      ========================= */}

      {!loading && error && (
        <div className="menu-message menu-error">
          <span className="state-icon">!</span>{error}
        </div>
      )}

      {/* =========================
          FOOD GRID
      ========================= */}

      {!loading &&
        !error &&
        filteredMenu.length > 0 && (
          <div className="food-grid">

            {filteredMenu.map((item) => (
              <FoodCard
                key={
                  item._id || item.id
                }
                {...item}
              />
            ))}

          </div>
        )}

      {/* =========================
          NO FOOD
      ========================= */}

        {!loading &&
          !error &&
          filteredMenu.length === 0 && (
            <div className="menu-message">
              <span className="state-icon">⌕</span>No dishes match those filters.
            </div>
          )}

      {/* =========================
          STICKY CART
      ========================= */}

      <StickyCart />
      </main>

      {/* =========================
          PROFILE MODAL
      ========================= */}

      {showProfile && (
        <div
          className="profile-overlay"
          onClick={() =>
            setShowProfile(false)
          }
        >

          <div
            className="profile-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="profile-modal-header">

              <div>

                <h2>
                  My Profile
                </h2>

                <p>
                  Manage your account
                </p>

              </div>

              <button
                onClick={() =>
                  setShowProfile(false)
                }
                className="profile-close-button"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleProfileUpdate}
            >

              {/* REGISTER NUMBER */}

              <label>
                Register Number
              </label>

              <input
                type="text"
                value={
                  student?.registerNumber || ""
                }
                readOnly
                className="profile-input profile-readonly"
              />

              {/* USERNAME */}

              <label>
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                className="profile-input"
                placeholder="Enter username"
              />

              {/* DEPARTMENT */}

              <label>
                Department
              </label>

              <input
                type="text"
                value={department}
                onChange={(e) =>
                  setDepartment(
                    e.target.value
                  )
                }
                className="profile-input"
                placeholder="Enter department"
              />

              {/* PASSWORD */}

              <label>
                New Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="profile-input"
                placeholder="Leave empty to keep current password"
              />

              {/* SUCCESS */}

              {profileMessage && (
                <div className="profile-success">
                  ✓ {profileMessage}
                </div>
              )}

              {/* ERROR */}

              {profileError && (
                <div className="profile-error">
                  {profileError}
                </div>
              )}

              {/* UPDATE */}

              <button
                type="submit"
                disabled={savingProfile}
                className="profile-update-button"
              >
                {savingProfile
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </form>

            {/* LOGOUT */}

            <button
              onClick={handleLogout}
              className="profile-logout-button"
            >
              <LogOut size={16} aria-hidden="true" />
              Logout
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Menu;
