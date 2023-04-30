import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, ADD_USER } from "../../utils/mutations";

import Auth from "../../utils/auth";

import "../Login/login.css";
import PageTransition from "../../components/PageTransition";

const Login = ({ setIsLogged }) => {
  const [loginFormState, setLoginFormState] = useState({
    email: "",
    password: "",
  });
  const [login, { loginError, loginData }] = useMutation(LOGIN_USER);

  const [signUpFormState, setSignUpFormState] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [addUser, { signUpError, signUpData }] = useMutation(ADD_USER);

  const { state } = useLocation();
  const navigate = useNavigate();
  const { from = null } = state || {};

  // update state based on login form input changes
  const handleLoginFormChange = (event) => {
    const { name, value } = event.target;

    setLoginFormState({
      ...loginFormState,
      [name]: value,
    });
  };

  // update state based on sign up form input changes
  const handleSignUpFormChange = (event) => {
    const { name, value } = event.target;

    setSignUpFormState({
      ...signUpFormState,
      [name]: value,
    });
  };

  // submit login form
  const handleLoginFormSubmit = async (event) => {
    event.preventDefault();
    console.log(loginFormState);
    try {
      const { data } = await login({
        variables: { ...loginFormState },
      });

      Auth.login(data.login.token);
      setIsLogged(Auth.loggedIn());

      if (from) {
        navigate(from);
      } else {
        navigate("/");
      }
    } catch (e) {
      console.error(e);
    }

    // clear form values
    setLoginFormState({
      email: "",
      password: "",
    });
  };

  // submit sign up form
  const handleSignUpFormSubmit = async (event) => {
    event.preventDefault();
    console.log(signUpFormState);

    try {
      const { data } = await addUser({
        variables: { ...signUpFormState },
      });

      Auth.login(data.addUser.token);
      setIsLogged(Auth.loggedIn());
      if (from) {
        navigate(from);
      } else {
        navigate("/");
      }
    } catch (e) {
      console.error(e);
    }

    // clear form values
    setSignUpFormState({
      username: "",
      email: "",
      password: "",
    });
  };

  return (
    <>
      <PageTransition>
        {/* Login In */}
        <main className="flex-row justify-center mb-4">
          <div className="col-12 col-lg-10">
            <div className="card">
              <h4 className="card-header">Login</h4>
              <div className="card-body">
                {loginData ? (
                  <p>
                    Success! You may now head{" "}
                    <Link to="/">back to the homepage.</Link>
                  </p>
                ) : (
                  <form onSubmit={handleLoginFormSubmit}>
                    <input
                      className="form-input"
                      placeholder="Your email"
                      name="email"
                      type="email"
                      value={loginFormState.email}
                      onChange={handleLoginFormChange}
                    />
                    <input
                      className="form-input"
                      placeholder="******"
                      name="password"
                      type="password"
                      value={loginFormState.password}
                      onChange={handleLoginFormChange}
                    />
                    <button
                      className="btn"
                      style={{ cursor: "pointer" }}
                      type="submit"
                    >
                      Submit
                    </button>
                  </form>
                )}

                {loginError && (
                  <div className="my-3 p-3 bg-danger text-white">
                    {loginError.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        {/* Sign Up */}
        <main className="flex-row justify-center mb-4">
          <div className="col-12 col-lg-10">
            <div className="card">
              <h4 className="card-header">Sign Up</h4>
              <div className="card-body">
                {signUpData ? (
                  <p>
                    Success! You may now head{" "}
                    <Link to="/">back to the homepage.</Link>
                  </p>
                ) : (
                  <form onSubmit={handleSignUpFormSubmit}>
                    <input
                      className="form-input"
                      placeholder="Your username"
                      name="username"
                      type="text"
                      value={signUpFormState.username}
                      onChange={handleSignUpFormChange}
                    />
                    <input
                      className="form-input"
                      placeholder="Your email"
                      name="email"
                      type="email"
                      value={signUpFormState.email}
                      onChange={handleSignUpFormChange}
                    />
                    <input
                      className="form-input"
                      placeholder="******"
                      name="password"
                      type="password"
                      value={signUpFormState.password}
                      onChange={handleSignUpFormChange}
                    />
                    <button
                      className="btn"
                      style={{ cursor: "pointer" }}
                      type="submit"
                    >
                      Submit
                    </button>
                  </form>
                )}

                {signUpError && (
                  <div className="my-3 p-3 bg-danger text-white">
                    {signUpError.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </PageTransition>
    </>
  );
};

export default Login;
