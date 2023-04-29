import React, { useState, useEffect, useContext } from "react";

// Create our theme context using React.CreateContext()
export const CartContext = React.createContext();

// Create a custom hook that allows easy access to our Cart values
export const useCart = () => useContext(CartContext);

// Creating our theme provider. Accepts an argument of "props", here we plucking off the "children" object.
export default function CartProvider({ children }) {
  // Creating our state
  const [cartItems, setCartItems] = useState([]);

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
    setCartItems([...cartItems, item]);
  };

  // Remove cart items from local state and local storage
  const onRemoveFromCart = (item) => {
    console.log("Remove from the Cart");
    setCartItems(cartItems.filter((cartItem) => cartItem.title !== item.title));
  };

  return (
    <CartContext.Provider value={{ cartItems, onAddToCart, onRemoveFromCart }}>
      {children}
    </CartContext.Provider>
  );
}
