import { Link, useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { QUERY_USER_FAVOURITES } from "../../utils/queries";
import { ADD_FAVOURITE, REMOVE_FAVOURITE } from "../../utils/mutations";
import { useQuery, useMutation } from "@apollo/client";
import "./productCard.css";

const ProductCard = (props) => {
  const location = useLocation();
  const { productName, imageUrl, price, _id, onAddToCart } = props;
  //query user's favourites by the product name
  const { data } = useQuery(QUERY_USER_FAVOURITES, {
    variables: { productName },
  });
  //initialize the add favourite mutation and query the user's favourites by the product name
  const [addFavourite] = useMutation(ADD_FAVOURITE, {
    refetchQueries: [
      { query: QUERY_USER_FAVOURITES, variables: { productName } },
    ],
  });
  //initialize the removefavourite mutation and query the user's favourites by the product name
  const [removeFavourite] = useMutation(REMOVE_FAVOURITE, {
    refetchQueries: [
      { query: QUERY_USER_FAVOURITES, variables: { productName } },
    ],
  });
  //define is favourites or return false if isFavourites boolean is false
  const isFavourite = data?.getFavourites ?? false;

  const handleToggleFavourite = () => {
    if (isFavourite) {
      //remove favourite from user's favourites
      removeFavourite({ variables: { productName } });
    } else {
      //add a new favourite to the user's favourites
      addFavourite({ variables: { productName } });
    }
  };

  return (
    <div>
      {location.pathname === "/" || location.pathname === "/basket" ? (
        <div className="border-home">
          <div className="product-details">
            <div className="product-price"></div>
            <button className="btn-favourite" onClick={handleToggleFavourite}>
              {isFavourite ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
          <div className="recent">
            <Link to={`/product/${_id}`}>
              <img
                src={`${imageUrl}`}
                alt={productName}
                className="product-image-recent"
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className="border-product">
          <div className="product">
            <img
              src={`${imageUrl}`}
              alt={productName}
              className="product-image p-5"
            />
          </div>
          <div className="product-details">
            <div className="product-price-pr ml-5">
              <p className="text-lg mr-5">£{price}</p>
              <div className="product-buttons">
                {location.pathname !== "/" && (
                  <button className="btn" onClick={onAddToCart}>
                    Add to Cart
                  </button>
                )}
                <button
                  className="btn-favourite"
                  onClick={handleToggleFavourite}
                >
                  {isFavourite ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
