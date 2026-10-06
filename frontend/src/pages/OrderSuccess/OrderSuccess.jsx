import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { generateOrderPDF } from "../../utils/generateOrderPDF";
import "./OrderSuccess.css";

function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const savedOrder = localStorage.getItem("canteenOrder");

    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Failed to parse saved order", e);
      }
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (!order) return;
    try {
      setDownloading(true);
      await generateOrderPDF({
        orderNumber: order.token || "001",
        orderId: order.orderId || "ORD-001",
        name: order.name || "Student",
        department: order.department ? `${order.department} - ${order.section || ""}` : "General",
        pickupTime: "5–10 mins",
        date: new Date(order.createdAt || Date.now()).toLocaleDateString("en-IN"),
        items: order.items || [],
        totalPrice: order.totalAmount || 0,
      });
    } catch (err) {
      console.error("PDF download failed", err);
    } finally {
      setDownloading(false);
    }
  };

  if (!order) {
    return (
      <div className="order-not-found">
        <div className="not-found-card">
          <h2>Order Not Found</h2>
          <p>We couldn't retrieve your recent order session.</p>
          <button
            type="button"
            className="back-menu-btn"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-page">

      <div className="order-success-card">

        {/* Animated Success Icon */}
        <div className="success-icon-wrap">
          <div className="success-icon">✓</div>
        </div>

        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Your order has been sent to the canteen kitchen and is being processed.
        </p>

        {/* Digital Pickup Token Pass */}
        <div className="token-pass-card">
          <div className="token-pass-top">
            <span className="token-label">DIGITAL PICKUP TOKEN</span>
            <strong className="token-display">#{order.token}</strong>
            <small>Display this token number at the pickup counter</small>
          </div>
          <div className="pass-divider">
            <div className="pass-notch notch-left"></div>
            <div className="pass-dash"></div>
            <div className="pass-notch notch-right"></div>
          </div>
          <div className="token-pass-bottom">
            <span><Clock3 size={15} aria-hidden="true" /> Estimated Preparation: <strong>5–10 Minutes</strong></span>
          </div>
        </div>

        {/* Order Details */}
        {/* Order Details Breakdown */}
        <div className="order-details-card">
          <div className="detail-row">
            <span>Order ID</span>
            <strong>{order.orderId || "-"}</strong>
          </div>

          <div className="detail-row">
            <span>Student Name</span>
            <strong>{order.name}</strong>
          </div>

          <div className="detail-row">
            <span>Department & Section</span>
            <strong>
              {order.department} - {order.section || "-"}
            </strong>
          </div>

          <hr className="details-hr" />

          <h3>Ordered Items</h3>

          <div className="order-items-list">
            {(order.items || []).map((item, index) => (
              <div key={item._id || index} className="order-item-row">
                <span className="item-name-qty">
                  {item.name} × <strong>{item.quantity}</strong>
                </span>
                <strong className="item-price-calc">
                  ₹{Number(item.price || 0) * Number(item.quantity || 0)}
                </strong>
              </div>
            ))}
          </div>

          <hr className="details-hr" />

          <div className="total-row">
            <span>Total Payable Amount</span>
            <strong>₹{order.totalAmount}</strong>
          </div>

          <div className="order-status-row">

            <span>Kitchen Status</span>
            <span className="received-badge">{order.orderStatus}</span>
          </div>

        </div>

        <p className="pickup-message">
          Your order is now waiting for the canteen to process it.
        </p>
        <div className="success-actions">
          <button
            type="button"
            className="download-receipt-btn"
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? "Generating PDF..." : "📥 Download Receipt (PDF)"}
          </button>

          <button
            type="button"
            className="back-menu-btn"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Back to Menu →
          </button>
        </div>
      </div>

    </div>
  );
}

export default OrderSuccess;