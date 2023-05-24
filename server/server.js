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
  cache: "bounded",
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

let cardInfo;

//Stripe webhook endpoint
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
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
      data = req.body.object;
      eventType = req.body.type;
    }

    if (eventType === "payment_intent.succeeded") {
      // Retrieve the payment method used to create the payment intent
      const paymentMethod = await stripe.paymentMethods.retrieve(
        data.payment_method
      );
      // Retrieve the card details from the payment method
      const card = paymentMethod.card;
      const cardDetails = {
        brand: card.brand,
        last4: card.last4,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
      };

      cardInfo = cardDetails;
    }

    // Handle the event
    let items;
    let customerInfo;
    if (eventType === "checkout.session.completed") {
      // Fetch the order from the database
      const customerDetails = await stripe.customers.retrieve(data.customer);
      items = customerDetails.metadata.cart;
      customerInfo = {
        userId: customerDetails.metadata.userId,
        customer_details: data.customer_details,
        total: data.amount_total,
        amount_shipping: data.total_details.amount_shipping,
      };
    }

    if (items) {
      resolvers.Mutation.createOrder(null, {
        cart: items,
        details: customerInfo,
        cardInfo: cardInfo,
      });
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
  }
);

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
