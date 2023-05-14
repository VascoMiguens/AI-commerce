import React, { useState } from "react";
import "./profile.css";
import { Navigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../context/CartContext";

import { QUERY_USER, QUERY_ME } from "../../utils/queries";

import Auth from "../../utils/auth";
import PageTransition from "../../components/PageTransition";
import Order from "../../components/Order";

const Profile = (props) => {
  const { username: userParam } = props;
  const { onAddToCart } = useCart();
  // set state for tab data
  const [activeTab, setActiveTab] = useState("orders");

  const { data, refetch } = useQuery(userParam ? QUERY_USER : QUERY_ME, {
    variables: { username: userParam },
  });

  const user = data?.me || data?.user || {};
  console.log(user);

  if (!user?.username) {
    return (
      <h4>
        You need to be logged in to see this. Use the navigation links above to
        sign up or log in!
      </h4>
    );
  }

  refetch();

  const renderOrders = () => (
    <div className="section">
      <div className="profile-container">
        {user?.orders?.length > 0 ? (
          <>
            {user?.orders?.map((order, index) => (
              <Order key={order._id} order={order} />
            ))}
          </>
        ) : (
          <p>No Orders Yet</p>
        )}
      </div>
    </div>
  );

  const renderFavourites = () => (
    <div className="section">
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
  );

  return (
    <PageTransition>
      <div>
        <div className="navbar">
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button
            className={activeTab === "favourites" ? "active" : ""}
            onClick={() => setActiveTab("favourites")}
          >
            Favourites
          </button>
        </div>
        <div className="profile">
          {activeTab === "orders" ? renderOrders() : renderFavourites()}
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
