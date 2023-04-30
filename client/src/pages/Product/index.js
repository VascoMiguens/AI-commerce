// UI Components
import ProductCard from "../../components/ProductCard";

import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { QUERY_SINGLE_PRODUCT } from "../../utils/queries";

// Shopping Cart
import { useCart } from "../../context/CartContext";
import "./product.css";
import PageTransition from "../../components/PageTransition";

const Product = () => {
  const { onAddToCart } = useCart();

  const { productId } = useParams();

  const { data } = useQuery(QUERY_SINGLE_PRODUCT, {
    // pass URL parameter
    variables: { productId: productId },
  });

  const product = data?.product || {};

  return (
    <>
      <PageTransition>
        <div className="product-container p-5 m-2 border w-75">
          <div className="section-title">
            <ProductCard
              key={product.productName}
              _id={product._id}
              imageUrl={product.imageUrl}
              price={product.price}
              productName={product.productName}
              labels={product.labels}
              onAddToCart={() => onAddToCart(product)}
            />
          </div>
        </div>
      </PageTransition>
    </>
  );
};

export default Product;
