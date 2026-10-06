import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";

import { AdminAuthProvider } from "./context/AdminAuthContext";

import AdminRoutes from "./routes/AdminRoutes";

import AdminLogin from "./pages/AdminLogin";
import AdminAuthReceiver from "./pages/AdminAuthReceiver";
import Dashboard from "./pages/Dashboard";
import FoodManagement from "./pages/FoodManagement";
import OrderManagement from "./pages/OrderManagement";
import Reports from "./pages/Reports";


function App() {
  return (
    <BrowserRouter>

      <AdminAuthProvider>

        <Routes>

          {/* Public */}
          <Route
            path="/login"
            element={<AdminLogin />}
          />

          <Route
            path="/auth/receive"
            element={<AdminAuthReceiver />}
          />

          {/* Protected Admin Routes */}
          <Route element={<AdminRoutes />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/food"
              element={<FoodManagement />}
            />

            <Route
              path="/orders"
              element={<OrderManagement />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />

        </Routes>

      </AdminAuthProvider>

    </BrowserRouter>
  );
}

export default App;