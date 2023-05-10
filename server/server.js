const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const { authMiddleware } = require("./utils/auth");
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_KEY);
mongoose.set("strictQuery", false);

const { typeDefs, resolvers } = require("./schemas");
const db = require("./config/connection");
const { default: axios } = require("axios");

const PORT = process.env.PORT || 3001;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: false })); 
app.use((req, res, next) => {
  if (req.originalUrl === "/webhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

//Stripe webhook endpoint
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
  const sig = req.headers["stripe-signature"];

  let data;
  let eventType;

  const rawBody = req.body.toString();
  if (endpointSecret) {
    let event;
    try {
      // Verify webhook signature and extract the event
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
      console.log("Webhook verified");
    } catch (err) {
      console.error(
        "Error occurred while validating Stripe webhook",
        err.message
      );
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Extract the object from the event
    data = event.data.object;
    // Extract the type of object from the event
    eventType = event.type;
  } else {
    data = req.body.data.object;
    eventType = req.body.type;
  }

  // Handle the event
  if (eventType === "checkout.session.completed") {
    // Fetch the order from the database
    stripe.customers
      .retrieve(data.customer)
      .then((customer) => {
        const cart = customer.metadata.cart;
        const total = data.amount_total;
        const amount_shipping = data.total_details.amount_shipping;
        const details = {
          customer_details: data.customer_details,
          total: total,
          amount_shipping: amount_shipping,
        };
        // call the mutation to create a new order
        resolvers.Mutation.createOrder(null, { cart: cart, details: details });
      })
      .catch((err) => console.log(err.message));
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  server.applyMiddleware({ app });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// Call the async function to start the server
startApolloServer(typeDefs, resolvers);
