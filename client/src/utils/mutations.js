import { gql } from "@apollo/client";

export const LOGIN_USER = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const ADD_USER = gql`
  mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(username: $username, email: $email, password: $password) {
      token
      user {
        _id
        username
      }
    }
  }
`;

export const CHECKOUT = gql`
  mutation checkout($amount: Int) {
    checkout(amount: $amount) {
      id
      client_secret
    }
  }
`;

export const SAVE_ARTWORK = gql`
  mutation AddRecentArt(
    $productName: String!
    $imageUrl: String!
    $price: Int!
  ) {
    addRecentArt(
      productName: $productName
      imageUrl: $imageUrl
      price: $price
    ) {
      productName
      price
      imageUrl
    }
  }
`;

export const SAVE_PRODUCT = gql`
  mutation AddProduct($productName: String!, $imageUrl: String!, $price: Int!) {
    addProduct(productName: $productName, imageUrl: $imageUrl, price: $price) {
      _id
      productName
      imageUrl
      price
    }
  }
`;

export const ADD_FAVOURITE = gql`
  mutation AddFavourite($productId: ID!) {
    addFavourite(productID: $productId) {
      _id
    }
  }
`;

export const REMOVE_FAVOURITE = gql`
  mutation RemoveFavourite($productId: ID!) {
    removeFavourite(productID: $productId) {
      _id
    }
  }
`;

export const CREATE_ART = gql`
  mutation CreateProduct($artUrl: String!, $inputText: String!, $price: Int!) {
    createProduct(artUrl: $artUrl, inputText: $inputText, price: $price) {
      _id
      productName
      imageUrl
      price
      labels
      webEntities
    }
  }
`;

export const PAYMENT_SESSION = gql`
  mutation CreatePaymentSession(
    $items: [CheckoutProduct!]!
    $successUrl: String!
    $cancelUrl: String!
  ) {
    createPaymentSession(
      items: $items
      successUrl: $successUrl
      cancelUrl: $cancelUrl
    ) {
      id
      url
    }
  }
`;

export const HANDLE_STRIPE_WEBHOOK = gql`
  mutation GetStripeWebhookEvents($payload: String!) {
    getStripeWebhookEvents(payload: $payload)
  }
`;
