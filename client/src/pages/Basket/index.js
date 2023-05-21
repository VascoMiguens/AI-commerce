import PageTransition from "../../components/PageTransition";
import "./basket.css";
import { useCart } from "../../context/CartContext";
import { useState } from "react";
import { PAYMENT_SESSION } from "../../utils/mutations";
import { useMutation } from "@apollo/client";

const Basket = () => {
  const { cartItems, onRemoveFromCart } = useCart();
  const [quantities, setQuantities] = useState({});
  const [paymentSession] = useMutation(PAYMENT_SESSION);

  const handleQuantityChange = (event, productId) => {
    const value = parseInt(event.target.value);
    setQuantities({ ...quantities, [productId]: value });
  };


  // increase item quantity 
  const handleIncrement = (productId) => {
    // increase quantity by 1
    setQuantities({
      ...quantities,
      [productId]: (quantities[productId] || 0) + 1,
    });
  };

  // decrease item quantity
  const handleDecrement = (productId) => {
    // if quantity is greater than 1, decrease quantity by 1
    if (quantities[productId] > 1) {
      setQuantities({ ...quantities, [productId]: quantities[productId] - 1 });
    }
  };

  // get product quantity
  const getProductQuantity = (productId) => quantities[productId] || 1;

  const handleCheckout = async () => {
    try {
      // create an array of items with the required properties
      const items = cartItems.map((item) => ({
        _id: item._id,
        productName: item.productName,
        imageUrl: item.imageUrl,
        price: item.price,
        quantity: quantities[item._id] || 1,
      }));
      // create a payment session
      const { data } = await paymentSession({
        variables: {
          items: items,
          successUrl: "http://localhost:3000/success",
          cancelUrl: "http://localhost:3000/basket",
        },
      });
      // redirect to checkout page
      window.location = data.createPaymentSession.url;
    } catch (error) {
      console.error(error);
    }
  };

  const shippingFee = 5;
  const taxPercentage = 0.15;

  // calculate subtotal
  const subtotal = cartItems.reduce((total, product) => {
    // get product quantity
    const quantity = getProductQuantity(product._id);
    return total + product.price * quantity;
  }, 0);

  const shipping = shippingFee;
  const tax = subtotal * taxPercentage;
  let total = subtotal + shipping + tax;

  return (
    <>
      <PageTransition>
        {cartItems.length === 0 ? (
          <h1>No items in your basket</h1>
        ) : (
          <div className="basket">
            <div className="basket-item border m-2 p-5">
              <div className="basket-items">
                <h2>Your Basket</h2>
                <table className="basket-table">
                  <thead className="basket-table-header">
                    <tr>
                      <th className="table-header-item">Item</th>
                      <th className="table-header-item">Name</th>
                      <th className="table-header-item">Quantity</th>
                      <th className="table-header-item">Price</th>
                      <th className="table-header-item">Total</th>
                      <th className="table-header-item"></th>
                    </tr>
                  </thead>
                  <tbody className="basket-table-body">
                    {cartItems?.map((product) => {
                      const quantity = getProductQuantity(product._id);

                      return (
                        <tr key={product._id}>
                          <td>
                            <div className="basket-image">
                              <div className="basket-frame">
                                <img
                                  src={product.imageUrl}
                                  alt={product.productName}
                                  className="product-image"
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="product-description">
                              {product.productName}
                            </div>
                          </td>
                          <td>
                            <div className="quantity-control">
                              <button
                                className="quantity-btn"
                                onClick={() => handleDecrement(product._id)}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                className="quantity-input"
                                value={quantity}
                                onChange={(e) =>
                                  handleQuantityChange(e, product._id)
                                }
                                min="1"
                              />
                              <button
                                className="quantity-btn"
                                onClick={() => handleIncrement(product._id)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="">£{product.price}</div>
                          </td>
                          <td>
                            <div className="">£{product.price * quantity}</div>
                          </td>
                          <td>
                            <div className="product-buttons">
                              <button
                                className="btn"
                                onClick={() => onRemoveFromCart(product)}
                              >
                                X
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="checkout border m-2 p-5">
              <h2>Summary</h2>
              <div className="checkout-summary">
                <table>
                  <tbody>
                    <tr>
                      <td>Subtotal</td>
                      <td>£{subtotal}</td>
                    </tr>
                    <tr>
                      <td>Shipping</td>
                      <td>£{shipping}</td>
                    </tr>
                    <tr>
                      <td>Tax (15%)</td>
                      <td>£{tax}</td>
                    </tr>
                    <tr>
                      <td>Total</td>
                      <td>£{total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button onClick={handleCheckout} className="btn">
                Checkout
              </button>
            </div>
          </div>
        )}
      </PageTransition>
    </>
  );
};

export default Basket;
