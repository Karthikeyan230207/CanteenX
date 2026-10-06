import { ShoppingBasket } from "lucide-react";
import { useCart } from "../../Context/CartContext";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    totalPrice,
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="empty-cart-card">
          <div className="empty-cart-icon"><ShoppingBasket size={44} aria-hidden="true" /></div>
          <h2>Your cart is currently empty</h2>
          <p>Explore today's freshly prepared canteen dishes and order ahead.</p>
          <button className="browse-menu-btn" onClick={() => navigate("/")}>
            Explore Today's Menu →
          </button>
        </div>
      </div>
    );
  }

  const totalQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="cart-page">

      <div className="cart-header">
        <div>
          <button className="back-link-btn" onClick={() => navigate("/")}>
            ← Back to Menu
          </button>
          <h1>Your Order Cart</h1>
          <p>
            {cart.length} unique {cart.length === 1 ? "item" : "items"} · {totalQuantity} total portions
          </p>
        </div>
      </div>

      <div className="cart-container">

        {/* Cart Items */}

        {/* Cart Items List */}
        <div className="cart-items">

          {cart.map((item) => (
            <div className="cart-item" key={item.id}>

              <img
                src={
                  item.image?.startsWith("http")
                    ? item.image
                    : `https://smart-canteen-system-pyyl.onrender.com/${item.image}`
                }
                alt={item.name}
                className="cart-item-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80";
                }}
              />

              <div className="cart-item-details">
                <div className="cart-item-meta">
                  <h3>{item.name}</h3>
                  {item.category && (
                    <span className="cart-item-category">{item.category}</span>
                  )}
                </div>

                <div className="item-unit-price">
                  ₹{item.price} <small>per portion</small>
                </div>

                <div className="quantity-controls">

                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => decreaseQuantity(item.id)}
                    title="Decrease quantity"
                  >
                    −
                  </button>

                  <span className="qty-number">{item.quantity}</span>

                  <button
                    type="button"
                    className="qty-btn"
                    onClick={() => increaseQuantity(item.id)}
                    title="Increase quantity"
                  >
                    +
                  </button>

                </div>

              </div>

              <div className="cart-item-right">

                <strong className="cart-item-total-price">
                  ₹{item.price * item.quantity}
                </strong>

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove item from cart"
                >
                  Remove
                </button>

              </div>

            </div>
          ))}

        </div>


        {/* Order Summary */}

        <aside className="order-summary" aria-label="Order summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Total Items</span>
            <strong>{totalQuantity}</strong>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{totalPrice}</span>
          </div>

          <div className="summary-row">
            <span>Canteen Taxes & Packaging</span>
            <span className="free-tag">FREE</span>
          </div>

          <hr />

          <div className="summary-total">
            <div>
              <span>Grand Total</span>
              <small>Payable at collection counter</small>
            </div>
            <strong>₹{totalPrice}</strong>
          </div>

          <button
            type="button"
            className="checkout-button"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout →
          </button>

        </aside>
      </div>

    </div>
  );
}

export default Cart;