import { Link } from "react-router-dom";

const BasketCard = (props) => {
  const { productName, imageUrl, price, _id, onRemoveFromCart } = props;

  return (
    <div className="border p-5 m-2 flex">
      <div>
        <img
          src={`${imageUrl}`}
          alt={productName}
          className="product-image p-5"
        />
      </div>
      <div className="product-details">
        <Link to={`/product/${_id}`}>{productName}</Link>
        <div className="product-price">
          <p className="text-lg mr-5">£{price}</p>
          <button className="btn btn-primary" onClick={onRemoveFromCart}>
            Remove from Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasketCard;
