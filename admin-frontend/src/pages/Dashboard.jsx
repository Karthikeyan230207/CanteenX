import { useEffect, useState } from "react";
import { Banknote, BadgeCheck, CircleAlert, CircleCheck, CircleX, Clock3, Package, UtensilsCrossed } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalFoods: 0,
    availableFoods: 0,
    lowStockFoods: 0,
    outOfStockFoods: 0,
    todayOrders: 0,
    receivedOrders: 0,
    collectedOrders: 0,
    todaySales: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH DASHBOARD DATA
  // ========================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard");

      if (response.data.success) {
        setStats(response.data.stats);
        setRecentOrders(response.data.recentOrders || []);
      }
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ========================================
  // FORMAT CURRENCY
  // ========================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-layout">

      <Sidebar />

      <main className="admin-main">

        <Header />

        {/* ================================= */}
        {/* PAGE HEADER */}
        {/* ================================= */}

        <div className="page-heading">

          <div>
            <h2>Dashboard</h2>

            <p>
              Overview of your canteen
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchDashboard}
          >
            ↻ Refresh
          </button>

        </div>

        {/* ================================= */}
        {/* LOADING */}
        {/* ================================= */}

        {loading && (
          <div className="dashboard-message">
            Loading dashboard...
          </div>
        )}

        {/* ================================= */}
        {/* ERROR */}
        {/* ================================= */}

        {!loading && error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ================================= */}
            {/* FOOD STATISTICS */}
            {/* ================================= */}

            <h3 className="dashboard-section-title">
              Food Overview
            </h3>

            <section className="dashboard-cards">

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <UtensilsCrossed size={20} aria-hidden="true" />
                </div>

                <div>
                  <p>Total Food</p>

                  <h3>
                    {stats.totalFoods}
                  </h3>
                </div>

              </div>

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <CircleCheck size={20} aria-hidden="true" />
                </div>

                <div>
                  <p>Available</p>

                  <h3>
                    {stats.availableFoods}
                  </h3>
                </div>

              </div>

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <CircleAlert size={20} aria-hidden="true" />
                </div>

                <div>
                  <p>Low Stock</p>

                  <h3>
                    {stats.lowStockFoods}
                  </h3>
                </div>

              </div>

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <CircleX size={20} aria-hidden="true" />
                </div>

                <div>
                  <p>Out of Stock</p>

                  <h3>
                    {stats.outOfStockFoods}
                  </h3>
                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* ORDER STATISTICS */}
            {/* ================================= */}

            <h3 className="dashboard-section-title">
              Today's Orders
            </h3>

            <section className="dashboard-cards">

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <Package size={20} aria-hidden="true" />
                </div>

                <div>
                  <p>Today's Orders</p>

                  <h3>
                    {stats.todayOrders}
                  </h3>
                </div>

              </div>

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <Clock3 size={20} aria-hidden="true" />
                </div>

                <div>
                  <p>Received</p>

                  <h3>
                    {stats.receivedOrders}
                  </h3>
                </div>

              </div>

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <BadgeCheck size={20} aria-hidden="true" />
                </div>

                <div>
                  <p>Collected</p>

                  <h3>
                    {stats.collectedOrders}
                  </h3>
                </div>

              </div>

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <Banknote size={20} aria-hidden="true" />
                </div>

                <div>
                  <p>Today's Sales</p>

                  <h3>
                    {formatCurrency(
                      stats.todaySales
                    )}
                  </h3>
                </div>

              </div>

            </section>

            {/* ================================= */}
            {/* RECENT ORDERS */}
            {/* ================================= */}

            <section className="recent-orders-section">

              <div className="section-header">

                <div>
                  <h3>Recent Orders</h3>

                  <p>
                    Latest orders received by the canteen
                  </p>
                </div>

              </div>

              {recentOrders.length === 0 ? (

                <div className="empty-orders">
                  No orders yet
                </div>

              ) : (

                <div className="orders-table-wrapper">

                  <table className="orders-table">

                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Student</th>
                        <th>Department</th>
                        <th>Amount</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Time</th>
                      </tr>
                    </thead>

                    <tbody>

                      {recentOrders.map((order) => (

                        <tr key={order._id}>

                          <td>
                            <strong>
                              #{order.token}
                            </strong>
                          </td>

                          <td>
                            {order.name}
                          </td>

                          <td>
                            {order.department}
                            {" - "}
                            {order.section}
                          </td>

                          <td>
                            {formatCurrency(
                              order.totalAmount
                            )}
                          </td>

                          <td>
                            <span className="payment-badge">
                              {order.paymentStatus}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                order.orderStatus ===
                                "RECEIVED"
                                  ? "status-badge received"
                                  : "status-badge collected"
                              }
                            >
                              {order.orderStatus}
                            </span>
                          </td>

                          <td>
                            {formatTime(
                              order.createdAt
                            )}
                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default Dashboard;