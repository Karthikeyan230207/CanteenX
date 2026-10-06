import { useNavigate } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { useCart } from "../../Context/CartContext";

import "./StickyCart.css";

function StickyCart() {
  const {
    cart,
    totalPrice,
  } = useCart();

  const navigate = useNavigate();

  // Calculate total quantity
  const itemCount = (cart || []).reduce(
    (total, item) => total + Number(item.quantity || 0),
    0
  );

  // Hide when cart is empty
  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="sticky-cart">

      <div className="cart-info">

        <span className="cart-count">
          <ShoppingBasket size={15} aria-hidden="true" /> {itemCount}{" "}
          {itemCount === 1 ? "Item" : "Items"}
        </span>

        <span className="cart-total">
          ₹{Number(totalPrice).toFixed(0)}
        </span>

      </div>

      <button
        className="checkout-btn"
        onClick={() => navigate("/cart")}
      >
        View Cart →
      </button>

    </div>
  );
}

export default StickyCart;