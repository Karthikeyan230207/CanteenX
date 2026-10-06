import { useState } from "react";
import { useCart } from "../../Context/CartContext";
import { useNavigate } from "react-router-dom";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const {
    cart,
    totalPrice,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [section, setSection] = useState("");

  const [loading, setLoading] = useState(false);

  // ========================================
  // CONFIRM ORDER
  // ========================================

  const handleConfirmOrder = async () => {
    // Validate name
    if (!name.trim()) {
      alert("Please enter your name");
      return;
    }

    // Validate department
    if (!department) {
      alert("Please select your department");
      return;
    }

    // Validate section
    if (!section.trim()) {
      alert("Please enter your section");
      return;
    }

    // Validate cart
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    try {
      setLoading(true);

      // ========================================
      // PREPARE CART ITEMS
      // ========================================

      const items = cart.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      }));

      // ========================================
      // CREATE ORDER
      // ========================================

      const response = await fetch(
        "https://smart-canteen-system-pyyl.onrender.com/api/orders/create",
        {
          method: "POST",

          // Send login cookie
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name.trim(),
            department,
            section: section.trim(),
            items,
            totalAmount: totalPrice,
          }),
        }
      );

      // Convert response to JSON
      const data = await response.json();

      // ========================================
      // HANDLE ERROR
      // ========================================

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to place order"
        );
      }

      // ========================================
      // SUCCESS
      // ========================================

      if (data.success) {
        const order = data.order;

        // Save order temporarily
        localStorage.setItem(
          "canteenOrder",
          JSON.stringify(order)
        );

        // Clear cart
        clearCart();

        // Go to success page
        navigate("/order-success");
      }
    } catch (error) {
      console.error(
        "Order creation failed:",
        error
      );

      alert(
        error.message ||
          "Unable to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // EMPTY CART
  // ========================================

  if (cart.length === 0) {
    return (
      <div className="empty-checkout">
        <h2>
          Your cart is empty
        </h2>

        <button
          onClick={() => navigate("/")}
        >
          Browse Menu
        </button>
      </div>
    );
  }

  // ========================================
  // CHECKOUT UI
  // ========================================

  return (
    <div className="checkout-page">

      <div className="checkout-header">
        <h1>
          Confirm Order
        </h1>

        <p>
          Enter your details and confirm your order
        </p>
      </div>

      <div className="checkout-container">

        {/* ================================= */}
        {/* CUSTOMER DETAILS */}
        {/* ================================= */}

        <div className="customer-details">

          <h2>
            Your Details
          </h2>

          <div className="form-group">

            <label>
              Name
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
            />

          </div>

          <div className="form-group">

            <label>
              Department
            </label>

            <select
              value={department}
              onChange={(e) =>
                setDepartment(e.target.value)
              }
            >

              <option value="">
                Select Department
              </option>

              <option value="CSE">
                CSE
              </option>

              <option value="ECE">
                ECE
              </option>

              <option value="EEE">
                EEE
              </option>

              <option value="MECH">
                Mechanical
              </option>

              <option value="CIVIL">
                Civil
              </option>

            </select>

          </div>

          <div className="form-group">

            <label>
              Section
            </label>

            <input
              type="text"
              placeholder="Example: A"
              value={section}
              onChange={(e) =>
                setSection(e.target.value)
              }
            />

          </div>

        </div>

        {/* ================================= */}
        {/* ORDER SUMMARY */}
        {/* ================================= */}

        <div className="checkout-summary">

          <h2>
            Order Summary
          </h2>

          {cart.map((item) => (

            <div
              className="checkout-item"
              key={item.id}
            >

              <span>
                {item.name} × {item.quantity}
              </span>

              <strong>
                ₹{item.price * item.quantity}
              </strong>

            </div>

          ))}

          <hr />

          <div className="checkout-total">

            <span>
              Total
            </span>

            <strong>
              ₹{totalPrice}
            </strong>

          </div>

          {/* ================================= */}
          {/* CONFIRM ORDER BUTTON */}
          {/* ================================= */}

          <button
            className="pay-button"
            onClick={handleConfirmOrder}
            disabled={loading}
          >

            {loading
              ? "Placing Order..."
              : "Confirm Order"}

          </button>

        </div>

      </div>

    </div>
  );
}

export default Checkout;