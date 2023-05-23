import { useState, useEffect } from "react";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CartProvider from "./context/CartContext";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import Basket from "./pages/Basket";
import Product from "./pages/Product";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import auth from "./utils/auth";
import Webhook from "./pages/Webhook";
import Gallery from "./pages/Gallery";
import Success from "./pages/Success";

// Construct our main GraphQL API endpoint
const httpLink = createHttpLink({
  uri: "/graphql",
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem("id_token");
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const client = new ApolloClient({
  // Set up our client to execute the `authLink` middleware prior to making the request to our GraphQL API
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const stripePromise = loadStripe(`${process.env.REACT_APP_PUBLISHABLE_KEY}`);

function App() {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    setIsLogged(auth.loggedIn());
  }, []);

  return (
    <ApolloProvider client={client}>
      <Elements stripe={stripePromise}>
        <CartProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/login"
                  element={<Login setIsLogged={setIsLogged} />}
                />
                <Route path="/signup" element={<Login />} />
                <Route path="/basket" element={<Basket />} />
                <Route path="/profiles/:username" element={<Profile />} />
                <Route path="/product/:productId" element={<Product />} />
                <Route path="/webhook" element={<Webhook />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/success" element={<Success />} />
              </Routes>
            </Layout>
          </Router>
        </CartProvider>
      </Elements>
    </ApolloProvider>
  );
}

export default App;
