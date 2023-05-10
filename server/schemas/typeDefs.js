const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    password: String
    orders: [Order]!
    recentArt: [Product]!
    favourites: [Favourite]!
  }

  type Product {
    _id: ID
    productName: String
    imageUrl: String
    price: Int
    labels: [String]
    webEntities: [String]
  }

  type Order {
    _id: ID!
    userId: ID!
    items: [OrderItem!]!
    shipping: [ShippingAddress!]!
    phone: String!
    amount_shipping: Float!
    total: Float!
    createdAt: String!
  }

  type OrderItem {
    product: Product!
    quantity: Int!
  }

  type ShippingAddress {
    city: String!
    country: String!
    address: String!
    postalCode: String!
  }

  type Auth {
    token: ID!
    user: User
  }

  type Payment {
    id: String
    client_secret: String
  }

  type Favourite {
    _id: ID!
    productId: Product!
    isFavourite: Boolean!
  }

  type StripeCheckoutSession {
    id: ID!
    url: String!
  }

  input CheckoutProduct {
    _id: String!
    productName: String!
    imageUrl: String!
    price: Int!
    quantity: Int!
  }

  type BasketOrder {
    id: ID!
    shipping: ShippingInfo!
    products: [BasketProduct!]!
  }

  type ShippingInfo {
    name: String!
    address: String!
    city: String!
    state: String!
    country: String!
    postalCode: String!
  }

  type BasketProduct {
    id: ID!
    name: String!
    description: String!
    price: Float!
  }

  scalar DateTime

  type StripePaymentIntent {
    id: ID!
    amount: Int!
    created: DateTime!
  }

  type StripeCustomer {
    id: ID!
    email: String!
  }

  union StripeWebhookData = StripePaymentIntent | StripeCustomer

  type StripeWebhookEvent {
    id: ID!
    type: String!
    data: StripeWebhookData!
  }

  input cart {
    productId: ID!
    quantity: Int!
  }

  input details {
    customer_details: [sub_details!]!
    total: Int!
    amount_shipping: Int!
  }

  input sub_details {
    address: [adress!]!
    phone: String!
  }

  input adress {
    city: String!
    country: String!
    line1: String!
    line2: String!
    postal_code: String!
    state: String
  }

  type Query {
    users: [User]
    user(username: String!): User
    me: User
    products: [Product]
    product(productId: ID!): Product
    orders: [Order]
    order(orderId: ID!): Order
    recentArt: User
    getFavourites(productID: ID!): Boolean
    searchArt(inputText: String!): [Product]
  }

  type Mutation {
    addUser(username: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth
    createPaymentSession(
      items: [CheckoutProduct!]!
      successUrl: String!
      cancelUrl: String!
    ): StripeCheckoutSession!
    createOrder(cart: [cart!]!, details: [details!]!): Order!
    addRecentArt(productName: String!, imageUrl: String!, price: Int!): Product!
    addProduct(productName: String!, imageUrl: String!, price: Int): Product!
    addFavourite(productID: ID!): User!
    removeFavourite(productID: ID!): User!
    createProduct(artUrl: String!, inputText: String!, price: Int!): Product!
    getStripeWebhookEvents(payload: String!): Boolean
  }
`;

module.exports = typeDefs;
