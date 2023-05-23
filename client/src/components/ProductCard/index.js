import { Link, useLocation } from "react-router-dom";
import { FaHeart, FaRegHeart, FaCartPlus } from "react-icons/fa";
import { QUERY_USER_FAVOURITES } from "../../utils/queries";
import { ADD_FAVOURITE, REMOVE_FAVOURITE } from "../../utils/mutations";
import { useQuery, useMutation } from "@apollo/client";
import "./productCard.css";

const ProductCard = (props) => {
  const location = useLocation();
  const { productName, imageUrl, price, _id, onAddToCart, userName } = props;

  //encode username for cases that the name has spaces
  let encodedUserName;
  if (userName) {
    encodedUserName = userName.includes(" ")
      ? encodeURIComponent(userName)
      : userName;
  }
  //query user's favourites by the product name
  const { data, refetch } = useQuery(QUERY_USER_FAVOURITES, {
    variables: { productId: _id },
  });

  //initialize the add favourite mutation and query the user's favourites by the product id
  const [addFavourite] = useMutation(ADD_FAVOURITE, {
    refetchQueries: [
      { query: QUERY_USER_FAVOURITES, variables: { productId: _id } },
    ],
  });
  //initialize the removefavourite mutation and query the user's favourites by the product id
  const [removeFavourite] = useMutation(REMOVE_FAVOURITE, {
    refetchQueries: [
      { query: QUERY_USER_FAVOURITES, variables: { productId: _id } },
    ],
  });
  //define is favourite or return false if isFavourite is false
  const isFavourite = data?.getFavourites ?? false;
  console.log(data);
  const handleToggleFavourite = () => {
    if (isFavourite) {
      //remove favourite from user's favourites
      removeFavourite({ variables: { productId: _id } });
    } else {
      console.log(_id);
      //add a new favourite to the user's favourites
      addFavourite({ variables: { productId: _id } });
    }
  };

  refetch();

  return (
    <div>
      {location.pathname === "/" ||
      location.pathname === `/profiles/${encodedUserName}` ||
      location.pathname === "/gallery" ? (
        <div className="border-home">
          <div className="recent">
            <img
              src={`${imageUrl}`}
              alt={productName}
              className="product-image-recent"
            />
            <div className="overlay">
              <Link className="link" to={`/product/${_id}`}>
                View
              </Link>
              <div className="recent-buttons">
                <button className="btn-skin" onClick={handleToggleFavourite}>
                  {isFavourite ? <FaHeart /> : <FaRegHeart />}
                </button>
                <button className="btn-skin" onClick={onAddToCart}>
                  <FaCartPlus />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : location.pathname === `/product/${_id}` ? (
        <div className="border-product">
          <div className="product">
            <div className="image-frame">
              <img
                src={`${imageUrl}`}
                alt={productName}
                className="product-image"
              />
            </div>
          </div>
          <div className="product-details">
            <div className="product-price-pr ml-5">
              <p className="product-name">"{productName}"</p>
              <p>Price: £{price}</p>
              <div className="recent-buttons">
                <button className="btn-skin" onClick={onAddToCart}>
                  <FaCartPlus />
                </button>
                <button className="btn-skin" onClick={handleToggleFavourite}>
                  {isFavourite ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default ProductCard;
