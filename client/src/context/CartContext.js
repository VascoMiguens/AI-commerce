import React, { useState, useEffect, useContext } from "react";

// Create our theme context using React.CreateContext()
export const CartContext = React.createContext();

// Create a custom hook that allows easy access to our Cart values
export const useCart = () => useContext(CartContext);

// Creating our theme provider. Accepts an argument of "props", here we plucking off the "children" object.
export default function CartProvider({ children }) {
  // Creating our state
  const [cartItems, setCartItems] = useState([]);
  const [showAddedToCartPopup, setShowAddedToCartPopup] = useState(false);

  // Load cart items from local storage on mount
  useEffect(() => {
    const storedCartItems = localStorage.getItem("cartItems");
    if (storedCartItems) {
      setCartItems(JSON.parse(storedCartItems));
    }
  }, []);

  // Save cart items to local storage on update
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Store cart items in local state
  const onAddToCart = (item) => {
    console.log("Adding to the Cart");
    // Check if item is already in cart
    const itemExists = cartItems.some((cartItem) => cartItem._id === item._id);
    if (itemExists) {
      // Show warning and return without adding item
      setShowAddedToCartPopup("Item already added!");
    } else {
      setCartItems([...cartItems, item]);
      setShowAddedToCartPopup("Item added to cart!");
    }
    setTimeout(() => {
      setShowAddedToCartPopup(false);
    }, 3000);
  };

  // Remove cart items from local state and local storage
  const onRemoveFromCart = (item) => {
    console.log("Remove from the Cart");
    setCartItems(cartItems.filter((cartItem) => cartItem._id !== item._id));
  };

  return (
    <CartContext.Provider value={{ cartItems, onAddToCart, onRemoveFromCart }}>
      {children}
      {showAddedToCartPopup && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            zIndex: 100,
            background: "white",
            padding: 10,
          }}
        >
          <p>{showAddedToCartPopup}</p>
          <button onClick={() => setShowAddedToCartPopup(false)}>Close</button>
        </div>
      )}
    </CartContext.Provider>
  );
}
