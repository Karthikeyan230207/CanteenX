import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  const location = useLocation();

  // Wait until session checking is complete
  if (loading) {
    return (
      <div style={styles.loading}>
        Checking your session...
      </div>
    );
  }

  // Not logged in
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Logged in
  return children;
}

const styles = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: "18px",
  },
};

export default ProtectedRoute;