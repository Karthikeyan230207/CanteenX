import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import api from "../services/api";

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [actionLoading, setActionLoading] = useState(false);

  // ========================================
  // FETCH ORDERS
  // ========================================

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/all");

      if (response.data.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error("Fetching orders failed:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ========================================
  // FILTER ORDERS
  // ========================================

  const filteredOrders = orders.filter((order) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      order.orderId
        ?.toLowerCase()
        .includes(searchValue) ||
      order.name
        ?.toLowerCase()
        .includes(searchValue) ||
      String(order.token).includes(searchValue);

    const matchesStatus =
      statusFilter === "ALL" ||
      order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ========================================
  // FORMAT CURRENCY
  // ========================================

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ========================================
// ACCEPT / REJECT ORDER
// ========================================

const updateOrderStatus = async (action) => {
  if (!selectedOrder) return;

  try {
    setActionLoading(true);
    setError("");

    const response = await api.patch(
      `/orders/${selectedOrder._id}/${action}`
    );

    if (response.data.success) {
      const updatedOrder = response.data.order;

      // Update table
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id
            ? updatedOrder
            : order
        )
      );

      // Update modal
      setSelectedOrder(updatedOrder);
    }

  } catch (error) {

    console.error(
      `${action} order failed:`,
      error
    );

    setError(
      error.response?.data?.message ||
        `Unable to ${action} order`
    );

  } finally {
    setActionLoading(false);
  }
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
            <h2>Order Management</h2>

            <p>
              View and monitor student orders
            </p>
          </div>

          <button
            className="refresh-btn"
            onClick={fetchOrders}
          >
            ↻ Refresh
          </button>

        </div>


        {/* ================================= */}
        {/* ORDER SUMMARY */}
        {/* ================================= */}

        <section className="order-summary">

          <div className="order-summary-card">
            <span>Total Orders</span>
            <strong>{orders.length}</strong>
          </div>

          <div className="order-summary-card">
            <span>Received</span>
            <strong>
              {
                orders.filter(
                  (order) =>
                    order.orderStatus === "RECEIVED"
                ).length
              }
            </strong>
          </div>

          <div className="order-summary-card">
            <span>Accepted</span>
            <strong>
              {
                orders.filter(
                  (order) =>
                    order.orderStatus === "ACCEPTED"
                ).length
              }
            </strong>
          </div>

          <div className="order-summary-card">
            <span>Rejected</span>
            <strong>
              {
                orders.filter(
                  (order) =>
                    order.orderStatus === "REJECTED"
                ).length
              }
            </strong>
          </div>

        </section>


        {/* ================================= */}
        {/* FILTER BAR */}
        {/* ================================= */}

        <section className="order-panel">

          <div className="order-toolbar">

            <div className="order-search">

              <Search size={16} aria-hidden="true" />

              <input
                type="text"
                placeholder="Search by token, order ID or student..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="order-status-filter"
            >

              <option value="ALL">
                All Orders
              </option>

              <option value="RECEIVED">
                Received
              </option>

              <option value="ACCEPTED">
                Accepted
              </option>

              <option value="REJECTED">
                Rejected
              </option>

              <option value="COLLECTED">
                Collected
              </option>

            </select>

          </div>


          {/* ================================= */}
          {/* LOADING */}
          {/* ================================= */}

          {loading && (
            <div className="order-message">
              Loading orders...
            </div>
          )}


          {/* ================================= */}
          {/* ERROR */}
          {/* ================================= */}

          {!loading && error && (
            <div className="order-message order-error">
              {error}
            </div>
          )}


          {/* ================================= */}
          {/* NO ORDERS */}
          {/* ================================= */}

          {!loading &&
            !error &&
            filteredOrders.length === 0 && (
              <div className="order-message">
                No orders found.
              </div>
            )}


          {/* ================================= */}
          {/* ORDER TABLE */}
          {/* ================================= */}

          {!loading &&
            !error &&
            filteredOrders.length > 0 && (

              <div className="orders-table-wrapper">

                <table className="orders-table">

                  <thead>

                    <tr>
                      <th>Token</th>
                      <th>Order ID</th>
                      <th>Student</th>
                      <th>Department</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredOrders.map((order) => (

                      <tr key={order._id} onClick={() => setSelectedOrder(order)} className="order-row-clickable">

                        <td>
                          <strong>
                            #{order.token}
                          </strong>
                        </td>

                        <td>
                          {order.orderId}
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

                          <div className="order-items">

                            {order.items?.map(
                              (item, index) => (
                                <div
                                  key={index}
                                >
                                  {item.name} ×{" "}
                                  {item.quantity}
                                </div>
                              )
                            )}

                          </div>

                        </td>

                        <td>
                          <strong>
                            {formatCurrency(
                              order.totalAmount
                            )}
                          </strong>
                        </td>

                        <td>

                          <span className="payment-badge">
                            {order.paymentStatus}
                          </span>

                        </td>

                        <td>

                          <span
                            className={`status-badge ${order.orderStatus?.toLowerCase()}`}
                          >
                            {order.orderStatus}
                          </span>

                        </td>

                        <td>
                          {formatDate(
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

        {/* ================================= */}
{/* ORDER DETAILS MODAL */}
{/* ================================= */}

{selectedOrder && (
  <div
    className="order-modal-overlay"
    onClick={() => setSelectedOrder(null)}
  >
    <div
      className="order-modal"
      onClick={(e) => e.stopPropagation()}
    >

      {/* HEADER */}

      <div className="order-modal-header">

        <div>
          <h3>Order Details</h3>

          <p>
            Token #{selectedOrder.token}
          </p>
        </div>

        <button
          className="modal-close-btn"
          onClick={() => setSelectedOrder(null)}
        >
          ×
        </button>

      </div>


      <div className="order-detail-content">

        {/* ============================== */}
        {/* STUDENT DETAILS */}
        {/* ============================== */}

        <div className="detail-section">

          <h4>Student Details</h4>

          <div className="detail-grid">

            <div>
              <span>Name</span>
              <strong>
                {selectedOrder.name}
              </strong>
            </div>

            <div>
              <span>Department</span>
              <strong>
                {selectedOrder.department}
              </strong>
            </div>

            <div>
              <span>Section</span>
              <strong>
                {selectedOrder.section}
              </strong>
            </div>

            <div>
              <span>Token</span>
              <strong>
                #{selectedOrder.token}
              </strong>
            </div>

          </div>

        </div>


        {/* ============================== */}
        {/* ORDER ITEMS */}
        {/* ============================== */}

        <div className="detail-section">

          <h4>Ordered Items</h4>

          <div className="detail-items">

            {selectedOrder.items?.map(
              (item, index) => (

                <div
                  className="detail-item"
                  key={index}
                >

                  <div>

                    <strong>
                      {item.name}
                    </strong>

                    <span>
                      Quantity: {item.quantity}
                    </span>

                  </div>

                  <strong>
                    ₹
                    {(
                      item.price *
                      item.quantity
                    ).toLocaleString("en-IN")}
                  </strong>

                </div>

              )
            )}

          </div>

        </div>


        {/* ============================== */}
        {/* TOTAL */}
        {/* ============================== */}

        <div className="detail-total">

          <span>
            Total Amount
          </span>

          <strong>
            ₹
            {Number(
              selectedOrder.totalAmount
            ).toLocaleString("en-IN")}
          </strong>

        </div>


        {/* ============================== */}
        {/* PAYMENT DETAILS */}
        {/* ============================== */}

        <div className="detail-section">

          <h4>Payment Details</h4>

          <div className="detail-grid">

            <div>

              <span>
                Payment Status
              </span>

              <strong className="payment-badge">
                {selectedOrder.paymentStatus}
              </strong>

            </div>


            <div>

              <span>
                Payment ID
              </span>

              <strong className="detail-id">
                {selectedOrder.paymentId}
              </strong>

            </div>


            <div>

              <span>
                Razorpay Order ID
              </span>

              <strong className="detail-id">
                {selectedOrder.razorpayOrderId}
              </strong>

            </div>


            <div>

              <span>
                Order Status
              </span>

              <strong
                className={`status-badge ${
                  selectedOrder.orderStatus?.toLowerCase()
                }`}
              >
                {selectedOrder.orderStatus}
              </strong>

            </div>

          </div>

        </div>


        {/* ============================== */}
        {/* ORDER TIME */}
        {/* ============================== */}

        <div className="detail-date">

          Ordered on:{" "}

          {new Date(
            selectedOrder.createdAt
          ).toLocaleString("en-IN")}

        </div>

        {/* ================================= */}
{/* ORDER ACTIONS */}
{/* ================================= */}

{selectedOrder.orderStatus === "RECEIVED" && (

  <div className="order-actions">

    <button
      className="reject-order-btn"
      disabled={actionLoading}
      onClick={() =>
        updateOrderStatus("reject")
      }
    >
      {actionLoading
        ? "Processing..."
        : "Reject Order"}
    </button>

    <button
      className="accept-order-btn"
      disabled={actionLoading}
      onClick={() =>
        updateOrderStatus("accept")
      }
    >
      {actionLoading
        ? "Processing..."
        : "Accept Order"}
    </button>

  </div>

)}

      </div>

    </div>
  </div>
)}

      </main>

    </div>
  );
};

export default OrderManagement;