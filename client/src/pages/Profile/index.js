import React, { useState } from "react";
import "./profile.css";
import { useQuery } from "@apollo/client";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../context/CartContext";

import { QUERY_USER, QUERY_ME } from "../../utils/queries";

import PageTransition from "../../components/PageTransition";
import Order from "../../components/Order";
import Pagination from "../../components/Pagination";

const Profile = (props) => {
  const { username: userParam } = props;
  const { onAddToCart } = useCart();
  // set state for tab data
  const [activeTab, setActiveTab] = useState("orders");
  const [currentPage, setCurrentPage] = useState(1);
  const orderItemsPerPage = 1;
  const favouriteItemsPerPage = 8;

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

  // Pagination
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get paginated data
  const getPaginatedData = (data) => {
    const startIndex =
      (currentPage - 1) *
      (activeTab === "orders" ? orderItemsPerPage : favouriteItemsPerPage);
    const endIndex =
      startIndex +
      (activeTab === "orders" ? orderItemsPerPage : favouriteItemsPerPage);
    return data.slice(startIndex, endIndex);
  };

  const paginatedOrders = getPaginatedData(user?.orders || {});
  const paginatedFavourites = getPaginatedData(user?.favourites || {});

  const renderOrders = () => (
    <div className="section">
      <div className="profile-container">
        {user?.orders?.length > 0 ? (
          <>
            <div className="orders">
              {paginatedOrders.map((order, index) => (
                <Order key={order._id} order={order} />
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              itemsPerPage={orderItemsPerPage}
              totalItems={user?.orders?.length}
              onPageChange={handlePageChange}
            />
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
        {user?.favourites?.length > 0 ? (
          <>
            <div className="favourites">
              {paginatedFavourites.map((fav, index) => (
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
            <Pagination
              currentPage={currentPage}
              itemsPerPage={favouriteItemsPerPage}
              totalItems={user?.favourites?.length}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <p>No Favourites Yet</p>
        )}
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
