import "./order.css";

function Order(props) {
  const {
    order: {
      _id,
      createdAt,
      items,
      shipping,
      amount_shipping,
      cardDetails,
      total,
    },
  } = props;

  return (
    <div className="order-receipt">
      <div className="order-header">
        <table className="header-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order #</th>
              <th>Payment Method</th>
              <th>Shipping Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{createdAt}</td>
              <td>{_id}</td>
              <td>
                {cardDetails[0].brand} {cardDetails[0].last4}
              </td>
              <td>
                {shipping[0].country +
                  ", " +
                  shipping[0].address +
                  ", " +
                  shipping[0].city +
                  ", " +
                  shipping[0].postalCode}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="order-body">
        {items.map((item) => (
          <div className="order-items" key={item.product._id}>
            <img
              src={item.product.imageUrl}
              alt={item.product.productName}
              className="order-image"
            />
            <p>{item.product.productName}</p>
            <p>{"Qty: " + item.quantity}</p>
            <p>£{item.product.price * item.quantity}</p>
          </div>
        ))}
      </div>
      <table className="order-cost">
        <body>
          <tr>
            <td>Shipping</td>
            <td>{amount_shipping}</td>
          </tr>
          <tr>
            <td>Total</td>
            <td>£{total / 100}</td>
          </tr>
        </body>
      </table>
    </div>
  );
}

export default Order;
