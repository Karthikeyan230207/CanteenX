import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // =================================
  // GET FOOD ID
  // =================================

  const getFoodId = (food) => {
    return food._id || food.id;
  };

  // =================================
  // ADD ONE ITEM TO CART
  // =================================

  const addToCart = (food) => {
    const foodId = getFoodId(food);

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === foodId
      );

      // Already in cart
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === foodId
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      // New item
      return [
        ...prevCart,
        {
          ...food,
          id: foodId,
          quantity: 1,
        },
      ];
    });
  };

  // =================================
  // ADD MULTIPLE ITEMS TO CART
  // Used by Voice Assistant
  // =================================

  const addMultipleToCart = (food, quantity = 1) => {
    const foodId = getFoodId(food);

    // Safety check
    if (!foodId || quantity <= 0) {
      return;
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.id === foodId
      );

      // Already in cart
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === foodId
            ? {
                ...item,
                quantity: item.quantity + quantity,
              }
            : item
        );
      }

      

      // New item
      return [
        ...prevCart,
        {
          ...food,
          id: foodId,
          quantity: quantity,
        },
      ];
    });
  };

  // =================================
  // INCREASE QUANTITY
  // =================================

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // =================================
  // DECREASE QUANTITY
  // =================================

  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // =================================
  // REMOVE FROM CART
  // =================================

  const removeFromCart = (id) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.id !== id)
    );
  };

  // =================================
  // CLEAR CART
  // =================================

  const clearCart = () => {
    setCart([]);
  };

  // =================================
  // TOTAL PRICE
  // =================================

  const totalPrice = cart.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // =================================
  // PROVIDER
  // =================================

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addMultipleToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// =================================
// USE CART HOOK
// =================================

export const useCart = () => {
  return useContext(CartContext);
};