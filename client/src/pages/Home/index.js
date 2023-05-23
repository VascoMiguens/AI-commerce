// UI Components
import ProductCard from "../../components/ProductCard";
import React, { useEffect, useState, useMemo, useRef } from "react";
import "../Home/home.css";
import Pagination from "../../components/Pagination";
import { useCart } from "../../context/CartContext";
//save artwork mutation
import { CREATE_ART } from "../../utils/mutations";
import { useQuery, useMutation } from "@apollo/client";

//get user
import { QUERY_SEARCH } from "../../utils/queries";
import auth from "../../utils/auth";

import FullPageLoader from "../../components/FullPageLoader";
import PageTransition from "../../components/PageTransition";
import Carousel from "../../components/Carousel";
import deepai from "deepai";
import { Link } from "react-router-dom";
const Home = () => {
  const { onAddToCart } = useCart();
  const [input, setInput] = useState("");
  const [createArt] = useMutation(CREATE_ART);
  // create state to hold generated price
  const [price, setPrice] = useState("");
  // create state to hold generated image
  const [imageUrl, setImageUrl] = useState(null);
  const [isInputNotEmpty, setIsInputNotEmpty] = useState(false);
  //get the current user's data
  const [dataLoaded, setDataLoaded] = useState(false);
  const { data, refetch } = useQuery(QUERY_SEARCH);
  const userData = useMemo(() => {
    return data?.recentArt || {};
  }, [data]);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = auth.loggedIn();
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const generateImg = useRef(null);

  // Update the current page number when the page changes
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaginatedRecentSearches = (data) => {
    // Calculate the starting index of the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    // Calculate the ending index of the current page
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const paginatedData = dataLoaded
    ? // Retrieves the paginated data if dataLoaded is true
      getPaginatedRecentSearches(userData?.recentArt)
    : // Empty array if dataLoaded is false
      [];

  // Determine the length of the data if dataLoaded is true, otherwise assign an empty array
  let dataLength = dataLoaded ? userData.recentArt.length : [];

  useEffect(() => {
    if (userData && Object.keys(userData).length > 0) {
      // Set dataLoaded to true if userData is not empty
      setDataLoaded(true);
    }
  }, [userData]);

  let userInput;
  // handle input change
  const onInputChange = (event) => {
    userInput = event.target.value;
    if (userInput.length > 0) {
      setIsInputNotEmpty(true);
    } else {
      setIsInputNotEmpty(false);
    }
    const inputWords = input.trim().split(/\s+/).length;
    setPrice(parseInt(inputWords * 10));
  };

  const onButtonSubmit = async () => {
    setInput(userInput);
    setLoading(true);
    deepai.setApiKey(process.env.REACT_APP_DEEPAI_API_KEY);
    // create a new image based on the user's input

    const response = await deepai.callStandardApi("text2img", {
      text: userInput,
      grid_size: "1",
    });
    const imageUrl = response.output_url;
    setLoading(true);
    console.log(price);
    createArt({
      variables: {
        inputText: userInput,
        artUrl: imageUrl,
        price: price,
      },
    })
      .then((response) => {
        setImageUrl(response.data.createProduct.imageUrl);
        setPrice(response.data.createProduct.price);
        generateImg.current.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  //refetch userdata and populate lastest search
  refetch();

  return (
    <>
      <PageTransition>
        {loading ? (
          <FullPageLoader loaded={true} />
        ) : (
          <div className="home-container row row-cols-1 my-5 row-cols-sm-1 row-cols-md-1 row-cols-lg-2 w-90 border m-2 p-5">
            <h1 className="title">Create Your Own Artwork!</h1>
            <div className="art">
              <div className={isLoggedIn ? "left-section" : "logged-out"}>
                <div className="search-section">
                  <input
                    className="inputSearch"
                    type="text"
                    onChange={onInputChange}
                    placeholder="Enter your artwork description..."
                  />
                  <button
                    className={`home-btn ${isInputNotEmpty ? "generate" : ""}`}
                    onClick={onButtonSubmit}
                    disabled={!isInputNotEmpty}
                  >
                    Create
                  </button>
                </div>
                {imageUrl && !loading && (
                  <div className="searchedImage">
                    <div className="image-frame" ref={generateImg}>
                      <img
                        src={imageUrl}
                        className="renderedImage"
                        alt="Your Art"
                      />
                    </div>
                    <div className="image-details">
                      <p className="image-price">Price: ${price}</p>
                      <button className="btn" onClick={onAddToCart}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {imageUrl && auth.loggedIn() && (
                <div className="right-section">
                  <h2 className="right-h">Your Recent Artwork!</h2>
                  <div className="recent-img">
                    {paginatedData?.map((item) => (
                      <ProductCard
                        key={item._id}
                        _id={item._id}
                        imageUrl={item.imageUrl}
                        price={item.price}
                        productName={item.productName}
                        labels={item.labels}
                        onAddToCart={() => onAddToCart(item)}
                      />
                    ))}
                    <Pagination
                      currentPage={currentPage}
                      itemsPerPage={itemsPerPage}
                      totalItems={dataLength}
                      onPageChange={handlePageChange}
                    />
                  </div>
                </div>
              )}
            </div>
            <Link to="/gallery" className="gallery-text">
              Visit the Gallery
            </Link>
            <div className="carousel">
              <Carousel />
            </div>
          </div>
        )}
      </PageTransition>
    </>
  );
};

export default Home;
