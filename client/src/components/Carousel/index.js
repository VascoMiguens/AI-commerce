import { ALL_PRODUCTS } from "../../utils/queries";
import { useQuery } from "@apollo/client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import { Navigation, Pagination, A11y, EffectFade } from "swiper";
import "./carousel.css";
import { Link } from "react-router-dom";

function Carousel() {
  const { data } = useQuery(ALL_PRODUCTS);
  console.log(data);
  return (
    <>
      <Swiper
        modules={[Navigation, Pagination, A11y, EffectFade]}
        spaceBetween={20}
        slidesPerView={3}
        navigation={{
          prevEl: ".swiper-button-prev",
          nextEl: ".swiper-button-next",
          clickable: true,
        }}
        grabCursor={true}
      >
        {data?.products.map((product) => (
          <SwiperSlide key={product._id} className="swiper-slide">
            <img
              src={product.imageUrl}
              alt={product.productName}
              className="swiper-slide-img"
            />
            <div className="swiper-slide-content">
              <Link className="link" to={`/product/${product._id}`}>
                View
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="slider-controler">
        <div className="swiper-button-prev slider-arrow">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </div>
        <div className="swiper-button-next slider-arrow">
          <ion-icon name="arrow-forward-outline"></ion-icon>
        </div>
        <div className="swiper-pagination"></div>
      </div>
    </>
  );
}

export default Carousel;
