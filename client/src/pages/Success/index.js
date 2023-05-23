import axios from "axios";
import React from "react";
import { Link } from "react-router-dom";

const Sucess = () => {
  axios.get("http://localhost:3000/success").then((response) => {
    console.log(response);
  });
  localStorage.removeItem("cartItems");

  return (
    <div>
      <h1>Payment Successfull</h1>
      <Link to="/" className="btn btn-primary">
        Continue Shopping
      </Link>
    </div>
  );
};

export default Sucess;
