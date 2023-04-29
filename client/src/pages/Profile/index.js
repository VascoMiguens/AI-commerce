import React from "react";
import "./profile.css";
import { Navigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../context/CartContext";

import { QUERY_USER, QUERY_ME } from "../../utils/queries";

import Auth from "../../utils/auth";
import PageTransition from "../../components/PageTransition";

const Profile = (props) => {
  const { username: userParam } = props;
  console.log(props);
  const { onAddToCart } = useCart();

  const { loading, data, refetch } = useQuery(
    userParam ? QUERY_USER : QUERY_ME,
    {
      variables: { username: userParam },
    }
  );

  const user = data?.me || data?.user || {};
  console.log(user);

  // navigate to personal profile page if username is yours
  if (Auth.loggedIn() && Auth.getProfile().data.username === userParam) {
    return <Navigate to="/me" />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user?.username) {
    return (
      <h4>
        You need to be logged in to see this. Use the navigation links above to
        sign up or log in!
      </h4>
    );
  }

  refetch();

  return (
    <PageTransition>
      <div>
        <div className="profile">
          <h2>{user.username}</h2>
          <div style={{ border: "1px dotted #1a1a1a" }}></div>
          <div className="section">
            <h1>Recent Orders</h1>
            <div className="profile-container">
              {user?.orders?.map((order, index) => (
                <ProductCard />
              ))}
            </div>
          </div>
          <div className="section">
            <h1>Favourites</h1>
            <div className="profile-container">
              {user?.favourites?.map((fav, index) => (
                <ProductCard
                  key={fav.productId._id}
                  productName={fav.productId.productName}
                  price={fav.productId.price}
                  imageUrl={fav.productId.imageUrl}
                  _id={fav.productId._id}
                  onAddToCart={() => onAddToCart(fav.productId)}
                  userName={user.username}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
