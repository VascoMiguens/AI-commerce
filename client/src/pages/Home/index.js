// UI Components
import ProductCard from "../../components/ProductCard";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import "../Home/home.css";
import GalleryGrid from "../../components/Gallery";
// import { useQuery } from "@apollo/client";
// import { QUERY_FEATURED_PRODUCTS } from "../../utils/queries";

// Shopping Cart
import { useCart } from "../../context/CartContext";

import { FaSearch, FaHeart } from "react-icons/fa";
//save artwork mutation
import { SAVE_ARTWORK, SAVE_PRODUCT } from "../../utils/mutations";
import { useQuery, useMutation } from "@apollo/client";

//get user
import { QUERY_SEARCH } from "../../utils/queries";

//import auth
import Auth from "../../utils/auth";

const Home = () => {
  const { onAddToCart } = useCart();
  const [input, setInput] = useState("");
  //create state to hold the generated name
  const [artName, setArtName] = useState("");
  // create state to hold generated price
  const [price, setPrice] = useState("");
  // create state to hold generated image
  const [imageUrl, setImageUrl] = useState("");
  //get the current user's data
  const { data, refetch } = useQuery(QUERY_SEARCH);
  const userData = data?.recentArt || {};
  const [loading, setLoading] = useState(false);

  const [saveArtwork] = useMutation(SAVE_ARTWORK);
  const [addProduct] = useMutation(SAVE_PRODUCT);
  const onInputChange = (event) => {
    setInput(event.target.value);
    const inputWords = input.trim().split(/\s+/).length;
    setPrice(inputWords * 10);
  };

  const onButtonSubmit = () => {
    //generate a random adjective or noun
    const adjectives = [
      "mystical",
      "whimsical",
      "ethereal",
      "dreamy",
      "cosmic",
    ];
    const nouns = ["garden", "forest", "ocean", "mountain", "cloud"];
    const randomIndex = Math.floor(Math.random() * 5);
    const randomWord =
      Math.random() < 0.5 ? adjectives[randomIndex] : nouns[randomIndex];

    const newArtName = `${randomWord} ${input}`;
    axios
      .post(
        "https://api.openai.com/v1/images/generations",
        {
          model: "image-alpha-001",
          prompt: `generate an image of ${input}`,
          num_images: 1,
          size: "512x512",
          response_format: "url",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      )
      .then((response) => {
        const newImageURL = response.data.data[0].url;
        const formData = new FormData();
        formData.append("file", newImageURL);
        formData.append("upload_preset", "ai-commerce");
        axios
          .post(
            "https://api.cloudinary.com/v1_1/dejnb8hlo/image/upload",
            formData
          )
          .then((response) => {
            const cloudinaryURl = response.data.secure_url;
            setImageUrl(cloudinaryURl);
            setArtName(newArtName);

            if (Auth.loggedIn()) {
              try {
                const data = saveArtwork({
                  variables: {
                    productName: newArtName,
                    imageUrl: cloudinaryURl,
                    price: price,
                  },
                });
              } catch (err) {
                console.error(err);
              }
            } else {
              addProduct({
                variables: {
                  productName: newArtName,
                  imageUrl: cloudinaryURl,
                  price: price,
                },
              });
            }
            setLoading(false);
          });
      })
      .catch((err) => console.log(err));
  };
  //refetch userdata and populate lastest search
  refetch();

  useEffect(() => {
    setArtName("");
  }, [input]);

  return (
    <>
      <div className="home-container">
        <div className="left-section">
          <h2 className="search-h">Search for the art you want to see!</h2>
          <div className="search-section">
            <input
              className="inputSearch"
              type="text"
              onChange={onInputChange}
              placeholder="Search"
            />
            <button className="searchButton" onClick={onButtonSubmit}>
              <FaSearch className="w-6 h-6 text-gray-400 search-icon" />
            </button>
          </div>
          <div className="searchedImage">
            {imageUrl && <img src={imageUrl} alt={artName} />}
            {artName && (
              <>
                <p>{artName}</p>
                <p>Price: ${price}</p>
              </>
            )}
          </div>
          <div className="cartButton">
            <button className="cartButton" onClick={onAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
        <div className="right-section">
          <h2 className="right-h">Your Recent Artwork!</h2>
          <div className="recent-img">
            {userData?.recentArt?.map((art, index) => (
              <ProductCard
                key={art.productName}
                {...art}
                onAddToCart={() => onAddToCart(art)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-25 border m-2 p-5">
        {userData?.recentArt?.map((art, index) => (
          <ProductCard
            key={art._id}
            {...art}
            onAddToCart={() => onAddToCart(art)}
          />
        ))}
      </div>
    </>
  );
};

export default Home;
