import { useState } from "react";
import { BadgeCheck, Clock3, Zap } from "lucide-react";
import "./FoodCard.css";
import { useCart } from "../../Context/CartContext";

function FoodCard(props) {
  const { addToCart, cart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const stock = Number(props.stock ?? 0);

  const foodId = props._id || props.id;

  const cartItem = cart.find(
    (item) => (item._id || item.id) === foodId
  );

  const cartQuantity = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = stock === 0;
  const stockLimitReached = cartQuantity >= stock;
  const isLowStock = !isOutOfStock && stock <= 5;

  const handleAddToCart = () => {
    if (isOutOfStock || stockLimitReached) return;
    setIsAdding(true);
    addToCart(props);
    setTimeout(() => setIsAdding(false), 400);
  };

  const imageUrl = props.image?.startsWith("http")
    ? props.image
    : `https://smart-canteen-system-pyyl.onrender.com/${props.image}`;

  return (
    <div className={`food-card ${isOutOfStock ? "is-sold-out" : ""}`}>
      {/* CARD IMAGE & BADGES */}
      <div className="food-image-wrap">
        <img
          src={imageUrl}
          alt={props.name}
          className="food-image"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=80";
          }}
        />

        <div className="card-top-badges">
          {isOutOfStock ? (
            <span className="food-badge badge-danger">Sold Out</span>
          ) : isLowStock ? (
            <span className="food-badge badge-warning"><Zap size={13} aria-hidden="true" /> Only {stock} left</span>
          ) : (
            <span className="food-badge badge-success"><BadgeCheck size={13} aria-hidden="true" /> Available ({stock})</span>
          )}
        </div>

        <div className="image-overlay-gradient"></div>
      </div>

      {/* CARD CONTENT */}
      <div className="food-content">
        <div className="food-header-row">
          {props.category && <span className="category-tag">{props.category}</span>}
          <h3 className="food-title" title={props.name}>{props.name}</h3>
        </div>

        <div className="food-stock">
          {isOutOfStock ? (
            <span className="out-of-stock">
              Out of Stock
            </span>
          ) : (
            <span>
              Available: {stock}
            </span>
          )}
        </div>

        <div className="food-meta-row">
          <span className="food-time">
            <Clock3 size={14} aria-hidden="true" /> {props.time ? props.time : "Fresh 5-10m"}
          </span>
          <span className="food-stock-hint">
            {isOutOfStock ? "Out of stock" : `${stock} portions ready`}
          </span>
        </div>

        {/* BOTTOM PRICE & BUTTON */}
        <div className="food-bottom">
          <div className="price-block">
            <span className="currency-symbol">₹</span>
            <span className="price-number">{props.price}</span>
          </div>

          <button
            type="button"
            className={`add-button ${isAdding ? "button-bounce" : ""} ${
              cartQuantity > 0 ? "has-in-cart" : ""
            }`}
            disabled={isOutOfStock || stockLimitReached}
            onClick={handleAddToCart}
            title={
              isOutOfStock
                ? "This item is sold out"
                : stockLimitReached
                ? "Max stock reached for this item"
                : `Add ${props.name} to cart`
            }
          >
            {isOutOfStock ? (
              <span>Sold Out</span>
            ) : stockLimitReached ? (
              <span>Max Stock</span>
            ) : cartQuantity > 0 ? (
              <span>Added ({cartQuantity}) +</span>
            ) : (
              <span>+ Add</span>
            )}
          </button>

        </div>

      </div>
    </div>
  );
}

export default FoodCard;
