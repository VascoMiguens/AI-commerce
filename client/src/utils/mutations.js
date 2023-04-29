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
  mutation AddFavourite($productName: String!) {
    addFavourite(productName: $productName) {
      _id
    }
  }
`;

export const REMOVE_FAVOURITE = gql`
  mutation RemoveFavourite($productName: String!) {
    removeFavourite(productName: $productName) {
      _id
    }
  }
`;

export const CREATE_ART = gql`
  mutation CreateProduct($inputText: String!, $price: Int!) {
    createProduct(inputText: $inputText, price: $price) {
      _id
      productName
      imageUrl
      price
      labels
      webEntities
    }
  }
`;
