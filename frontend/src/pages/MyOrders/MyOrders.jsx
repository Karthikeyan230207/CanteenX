import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import "./MyOrders.css";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // FETCH MY ORDERS
  // ========================================

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://smart-canteen-system-pyyl.onrender.com/api/orders/my-orders",
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to fetch orders"
          );
        }

        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error(
          "Failed to fetch my orders:",
          error
        );

        setError(
          error.message || "Unable to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, []);

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ========================================
  // STATUS CLASS
  // ========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "ACCEPTED":
        return "status-accepted";

      case "REJECTED":
        return "status-rejected";

      case "RECEIVED":
        return "status-received";

      case "COLLECTED":
        return "status-collected";

      default:
        return "";
    }
  };

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="my-orders-page">
        <div className="orders-message">
          Loading your orders...
        </div>
      </div>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <div className="my-orders-page">
        <div className="orders-message orders-error">
          {error}

          <button
            onClick={() => navigate("/")}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // ========================================
  // UI
  // ========================================

  return (
    <div className="my-orders-page">

      {/* HEADER */}

      <div className="my-orders-header">

        <div>
          <h1>
            My Orders
          </h1>

          <p>
            View your recent canteen orders
          </p>
        </div>

        <button
          className="back-menu-button"
          onClick={() => navigate("/")}
        >
          ← Back to Menu
        </button>

      </div>

      {/* NO ORDERS */}

      {orders.length === 0 ? (
        <div className="no-orders">

          <div className="no-orders-icon">
            <ShoppingBag size={44} aria-hidden="true" />
          </div>

          <h2>
            No orders yet
          </h2>

          <p>
            Your orders will appear here.
          </p>

          <button
            onClick={() => navigate("/")}
          >
            Browse Menu
          </button>

        </div>
      ) : (

        /* ORDERS */

        <div className="orders-list">

          {orders.map((order) => (

            <div
              className="order-card"
              key={order._id}
            >

              {/* ORDER HEADER */}

              <div className="order-card-header">

                <div>
                  <span className="order-label">
                    Order ID
                  </span>

                  <h3>
                    {order.orderId}
                  </h3>
                </div>

                <div
                  className={`order-status ${getStatusClass(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus}
                </div>

              </div>

              {/* TOKEN */}

              <div className="order-token">

                <span>
                  Token
                </span>

                <strong>
                  #{order.token}
                </strong>

              </div>

              {/* ITEMS */}

              <div className="order-items">

                <h4>
                  Items
                </h4>

                {order.items?.map(
                  (item, index) => (

                    <div
                      className="order-item"
                      key={index}
                    >

                      <span>
                        {item.name}
                        {" × "}
                        {item.quantity}
                      </span>

                      <strong>
                        ₹
                        {item.price *
                          item.quantity}
                      </strong>

                    </div>

                  )
                )}

              </div>

              {/* FOOTER */}

              <div className="order-card-footer">

                <div>
                  <span>
                    Ordered on
                  </span>

                  <strong>
                    {formatDate(
                      order.createdAt
                    )}
                  </strong>
                </div>

                <div className="order-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    ₹{order.totalAmount}
                  </strong>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default MyOrders;