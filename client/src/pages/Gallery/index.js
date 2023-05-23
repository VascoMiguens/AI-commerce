import { useQuery } from "@apollo/client";
import { ALL_PRODUCTS, SEARCH_ART } from "../../utils/queries";
import { useState } from "react";
import ProductCard from "../../components/ProductCard";
import "./gallery.css";
import { useCart } from "../../context/CartContext";
import Pagination from "../../components/Pagination";

const Gallery = () => {
  const { onAddToCart } = useCart();
  const [input, setInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = input ? 10 : 15;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const { data: allProductsData } = useQuery(ALL_PRODUCTS);
  console.log(allProductsData);
  const { data: searchArtData } = useQuery(SEARCH_ART, {
    variables: { inputText: input },
    skip: !input, // don't run the query if input is falsy
  });

  const displayedItems = input
    ? // Use searchArt data if input is truthy
      searchArtData?.searchArt
    : // Use allProducts data if input is falsy
      allProductsData?.products;
  // Retrieve the portion of displayedItems corresponding to the current page
  const paginatedItems = displayedItems?.slice(startIndex, endIndex);

  const totalItems = input
    ? // Get the total number of items from searchArt data if input is truthy
      searchArtData?.searchArt?.length
    : // Get the total number of items from allProducts data if input is falsy
      allProductsData?.products?.length;

  console.log(searchArtData);

  const handlePageChange = (pageNumber) => {
    // Updates the current page number when the page changes
    setCurrentPage(pageNumber);
  };

  const onInputChange = (event) => {
    // Updates the input value when it changes
    setInput(event.target.value);
  };

  return (
    <>
      <div className="gallery">
        <div className="gallery-search">
          <input
            type="text"
            placeholder="search..."
            onChange={onInputChange}
            className="gallerySearch"
          />
        </div>
        <div className="results-container">
          <div className="results">
            {paginatedItems?.map((item) => (
              <ProductCard
                key={item._id}
                productName={item.productName}
                price={item.price}
                imageUrl={item.imageUrl}
                userName={item.username}
                _id={item._id}
                onAddToCart={() => onAddToCart(item)}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
};

export default Gallery;
