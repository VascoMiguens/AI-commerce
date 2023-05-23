import logo from "../../assets/logo.png";
import "../Header/header.css";

import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

import Auth from "../../utils/auth";

const Header = () => {
  const logout = (event) => {
    event.preventDefault();
    Auth.logout();
  };

  const { cartItems } = useCart();

  return (
    <div className="header">
      <div className="logo-section">
        <Link className="" to="/">
          <img src={logo} className="logo" alt="logo" />
        </Link>
        <h1 className="logo-h">Arty Intelligence</h1>
      </div>
      <div className="right-section">
        <Link className="" to="/">
          Home{" "}
        </Link>
        <Link className="" to="/gallery">
          Gallery{" "}
        </Link>
        <div className="cart-items">
          <Link className="" to="/basket">
            <svg
              width="30"
              height="30"
              viewBox="0 0 27 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="cart"
            >
              <path
                d="M17 22.5C17 22.8978 17.158 23.2794 17.4393 23.5607C17.7206 23.842 18.1022 24 18.5 24C18.8978 24 19.2794 23.842 19.5607 23.5607C19.842 23.2794 20 22.8978 20 22.5C20 22.1022 19.842 21.7206 19.5607 21.4393C19.2794 21.158 18.8978 21 18.5 21C18.1022 21 17.7206 21.158 17.4393 21.4393C17.158 21.7206 17 22.1022 17 22.5Z"
                stroke="black"
              />
              <path
                d="M8 22.5C8 22.8978 8.15804 23.2794 8.43934 23.5607C8.72064 23.842 9.10218 24 9.5 24C9.89782 24 10.2794 23.842 10.5607 23.5607C10.842 23.2794 11 22.8978 11 22.5C11 22.1022 10.842 21.7206 10.5607 21.4393C10.2794 21.158 9.89782 21 9.5 21C9.10218 21 8.72064 21.158 8.43934 21.4393C8.15804 21.7206 8 22.1022 8 22.5Z"
                stroke="black"
              />
              <path
                d="M1 1C1 1 1.5 1 2.5 2C3.5 3 4.15161 4.23023 4.5 5C6.78995 10.0598 6 18 6 18C6 20 9 20 9 20H20.5C20.5 20 22.8177 15.8815 24.5 13C26.4629 9.63791 25.5 10 22 10"
                stroke="black"
              />
            </svg>
            <div className="cart-items-count">{cartItems.length} </div>
          </Link>
        </div>
        {Auth.loggedIn() ? (
          <>
            <Link
              className="text-sm m-2"
              to={{
                pathname: `/profiles/${Auth.getProfile().data.username}`,
                state: { username: Auth.getProfile().data.username },
              }}
            >
              <FaUserCircle className="user" />
            </Link>
            <button className="btn-off text-sm m-2" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <div className="login-section">
            <Link className="m-2 text-sm" to="/login">
              Login
            </Link>
            |
            <Link className="m-2 text-sm" to="/login">
              Signup
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
