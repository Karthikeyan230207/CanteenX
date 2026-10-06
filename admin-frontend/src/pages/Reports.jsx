import { lazy, Suspense, useEffect, useState } from "react";
import {
  Building2,
  CalendarDays,
  Clock3,
  Download,
  Filter,
  ShoppingBag,
  Tags,
  TrendingUp,
  Trophy,
  Utensils,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

const DailySalesChart = lazy(() => import("../components/DailySalesChart"));

function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://smart-canteen-system-pyyl.onrender.com/api/orders";

  // ========================================
  // FETCH ANALYTICS
  // ========================================
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      let url = `${API_URL}/analytics`;

      if (from || to) {
        const params = new URLSearchParams();

        if (from) params.append("from", from);
        if (to) params.append("to", to);

        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load analytics");
      }

      setAnalytics(data);
    } catch (error) {
      console.error("Analytics error:", error);
      setError("Unable to load sales analytics");
    } finally {
      setLoading(false);
    }
  };

  // Load analytics when page opens
  useEffect(() => {
    fetchAnalytics();
  }, []);

  // ========================================
  // DOWNLOAD REPORT
  // ========================================
  const downloadReport = () => {
    let url = `${API_URL}/report/download`;

    if (from || to) {
      const params = new URLSearchParams();

      if (from) params.append("from", from);
      if (to) params.append("to", to);

      url += `?${params.toString()}`;
    }

    window.open(url, "_blank");
  };

  // ========================================
  // FORMAT CURRENCY
  // ========================================
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // ========================================
  // FORMAT HOUR
  // ========================================
  const formatHour = (hour) => {
    if (hour === null || hour === undefined) {
      return "No data";
    }

    const h = Number(hour);

    if (h === 0) return "12 AM";
    if (h < 12) return `${h} AM`;
    if (h === 12) return "12 PM";

    return `${h - 12} PM`;
  };

  return (
    <>
    <div className="admin-layout">
    <Sidebar/>
      <main className="admin-main">
        <Header
          title="Sales Reports"
          subtitle="Track revenue, order volume, and popular items"
        />

        <div className="reports-page-heading">
          <div>
            <span className="reports-eyebrow">PERFORMANCE OVERVIEW</span>
            <h2>Sales performance</h2>
            <p>Explore sales trends across your canteen.</p>
          </div>

          <div className="report-actions">
            <button
              className="report-button download-button"
              onClick={downloadReport}
              type="button"
            >
              <Download size={17} aria-hidden="true" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* ========================================
            DATE FILTER
        ======================================== */}

        <div className="date-filter">
          <div className="date-filter-heading">
            <Filter size={17} aria-hidden="true" />
            <span>Date range</span>
          </div>

          <div className="date-fields">
          <div className="date-field">
            <label htmlFor="report-from">From</label>

            <input
              id="report-from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="date-field">
            <label htmlFor="report-to">To</label>

            <input
              id="report-to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <button
            className="report-button apply-button"
            onClick={fetchAnalytics}
            disabled={loading}
            type="button"
          >
            <CalendarDays size={16} aria-hidden="true" />
            <span>{loading ? "Updating..." : "Apply dates"}</span>
          </button>
          </div>
        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* ========================================
            LOADING
        ======================================== */}

        {loading && (
          <div className="loading">
            Loading sales analytics...
          </div>
        )}

        {/* ========================================
            ANALYTICS
        ======================================== */}

        {!loading && analytics && (
          <>

            {/* SUMMARY CARDS */}

            <div className="summary-grid">

              <div className="summary-card">
                <div className="summary-card-icon revenue-icon">
                  <TrendingUp size={19} aria-hidden="true" />
                </div>
                <div className="summary-card-content">
                  <div className="card-label">Total Revenue</div>
                  <h2>{formatCurrency(analytics.summary.totalRevenue)}</h2>
                  <span className="card-description">From accepted orders</span>
                </div>
              </div>


              <div className="summary-card">
                <div className="summary-card-icon orders-icon">
                  <ShoppingBag size={19} aria-hidden="true" />
                </div>
                <div className="summary-card-content">
                  <div className="card-label">Total Orders</div>
                  <h2>{analytics.summary.totalOrders}</h2>
                  <span className="card-description">Accepted orders</span>
                </div>
              </div>


              <div className="summary-card">
                <div className="summary-card-icon items-icon">
                  <Utensils size={19} aria-hidden="true" />
                </div>
                <div className="summary-card-content">
                  <div className="card-label">Items Sold</div>
                  <h2>{analytics.summary.totalItemsSold}</h2>
                  <span className="card-description">Across all orders</span>
                </div>
              </div>

            </div>


            {/* ANALYTICS GRID */}

            <div className="analytics-grid">

              {/* BEST SELLING FOOD */}

              <div className="analytics-card">

                <h3><Trophy size={18} aria-hidden="true" />Best Selling Food</h3>

                {analytics.bestSellingFood ? (
                  <div className="best-seller">

                    <div>
                      <div className="best-seller-name">
                        {analytics.bestSellingFood.name}
                      </div>

                      <div className="best-seller-info">
                        {analytics.bestSellingFood.quantity} items sold
                      </div>
                    </div>

                    <div className="best-seller-revenue">
                      {formatCurrency(
                        analytics.bestSellingFood.revenue
                      )}
                    </div>

                  </div>
                ) : (
                  <div className="empty-state">
                    No sales data available
                  </div>
                )}

              </div>


              {/* PEAK ORDERING TIME */}

              <div className="analytics-card">

                <h3><Clock3 size={18} aria-hidden="true" />Peak Ordering Time</h3>

                {analytics.peakOrderingHour ? (
                  <div className="peak-box">

                    <div>
                      <div className="peak-time">
                        {formatHour(
                          analytics.peakOrderingHour.hour
                        )}
                      </div>

                      <div className="peak-orders">
                        Peak ordering period
                      </div>
                    </div>

                    <strong>
                      {analytics.peakOrderingHour.orders} orders
                    </strong>

                  </div>
                ) : (
                  <div className="empty-state">
                    No ordering data available
                  </div>
                )}

              </div>


              {/* FOOD-WISE SALES */}

              <div className="analytics-card full-width">

                <h3><Utensils size={18} aria-hidden="true" />Food-wise Sales</h3>

                {analytics.foodWiseSales.length > 0 ? (

                  <div className="sales-list">

                    {analytics.foodWiseSales.map(
                      (food, index) => {

                        const maxQuantity =
                          analytics.foodWiseSales[0].quantity;

                        const percentage =
                          (food.quantity / maxQuantity) * 100;

                        return (
                          <div
                            className="sales-row"
                            key={index}
                          >

                            <div className="sales-name">
                              {food.name}
                            </div>

                            <div className="sales-bar-container">

                              <div
                                className="sales-bar"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                            <div className="sales-quantity">
                              {food.quantity}
                            </div>

                            <div className="sales-revenue">
                              {formatCurrency(food.revenue)}
                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                ) : (
                  <div className="empty-state">
                    No food sales available
                  </div>
                )}

              </div>


              {/* CATEGORY SALES */}

              <div className="analytics-card">

                <h3><Tags size={18} aria-hidden="true" />Category-wise Sales</h3>

                {analytics.categoryWiseSales.length > 0 ? (

                  <div className="category-grid">

                    {analytics.categoryWiseSales.map(
                      (category, index) => (

                        <div
                          className="category-row"
                          key={index}
                        >

                          <span className="category-name">
                            {category.category}
                          </span>

                          <span className="category-details">
                            {category.quantity} items ·{" "}
                            {formatCurrency(category.revenue)}
                          </span>

                        </div>

                      )
                    )}

                  </div>

                ) : (
                  <div className="empty-state">
                    No category data available
                  </div>
                )}

              </div>


              {/* DEPARTMENT SALES */}

              <div className="analytics-card">

                <h3><Building2 size={18} aria-hidden="true" />Department-wise Orders</h3>

                {analytics.departmentWiseOrders.length > 0 ? (

                  <div className="department-list">

                    {analytics.departmentWiseOrders.map(
                      (department, index) => (

                        <div
                          className="department-row"
                          key={index}
                        >

                          <span>
                            {department.department}
                          </span>

                          <strong>
                            {department.orders} orders
                          </strong>

                        </div>

                      )
                    )}

                  </div>

                ) : (
                  <div className="empty-state">
                    No department data available
                  </div>
                )}

              </div>


              {/* DAILY SALES */}

              <div className="analytics-card full-width">
                {analytics.dailySales.length > 0 ? (
                  <>
                    <Suspense fallback={<div className="daily-chart-loading">Preparing chart...</div>}>
                      <DailySalesChart
                        data={analytics.dailySales}
                        formatCurrency={formatCurrency}
                        periodLabel={from || to ? `${from || "Start"} to ${to || "Today"}` : "All available data"}
                      />
                    </Suspense>

                    <details className="daily-data-details">
                      <summary>View daily figures</summary>
                      <div className="daily-table-wrap">
                        <table className="daily-table">
                          <thead>
                            <tr><th>Date</th><th>Orders</th><th>Revenue</th></tr>
                          </thead>
                          <tbody>
                            {analytics.dailySales.map((day) => (
                              <tr key={day.date}>
                                <td>{day.date}</td>
                                <td>{day.orders}</td>
                                <td>{formatCurrency(day.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </details>
                  </>
                ) : (
                  <div className="empty-state">
                    No daily sales available
                  </div>
                )}

              </div>

            </div>

          </>
        )}
        
      </main>
      </div>
    </>
  );
}

export default Reports;