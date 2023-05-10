import { gql } from "@apollo/client";

export const QUERY_USER = gql`
  query user($username: String!) {
    user(username: $username) {
      _id
      username
      email
    }
  }
`;

export const QUERY_SINGLE_PRODUCT = gql`
  query Product($productId: ID!) {
    product(productId: $productId) {
      _id
      productName
      imageUrl
      price
      labels
      webEntities
    }
  }
`;

export const QUERY_FEATURED_PRODUCTS = gql`
  query Products {
    products {
      _id
      title
      description
      image
      price
      createdAt
    }
  }
`;

export const QUERY_USER_FAVOURITES = gql`
  query GetFavourites($productId: ID!) {
    getFavourites(productID: $productId)
  }
`;

export const QUERY_ME = gql`
  query Me {
    me {
      _id
      username
      email
      password
      orders {
        _id
        total
        items {
          product {
            _id
            productName
            imageUrl
            price
            labels
            webEntities
          }
          quantity
        }
        createdAt
        phone
        shipping {
          city
          country
          address
          postalCode
        }
        amount_shipping
        userId
      }
      recentArt {
        _id
        productName
        imageUrl
        price
        labels
        webEntities
      }
      favourites {
        _id
        productId {
          _id
          productName
          imageUrl
          price
          labels
          webEntities
        }
        isFavourite
      }
    }
  }
`;

export const QUERY_SEARCH = gql`
  query RecentArt {
    recentArt {
      recentArt {
        _id
        productName
        price
        imageUrl
      }
    }
  }
`;

export const ALL_PRODUCTS = gql`
  query Products {
    products {
      _id
      productName
      imageUrl
      price
      labels
      webEntities
    }
  }
`;

export const SEARCH_ART = gql`
  query SearchArt($inputText: String!) {
    searchArt(inputText: $inputText) {
      _id
      productName
      imageUrl
      price
      labels
      webEntities
    }
  }
`;
