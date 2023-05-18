require("dotenv").config();
const { AuthenticationError } = require("apollo-server-express");
const { User, Product, Order, Favourite } = require("../models");
const { signToken } = require("../utils/auth");
const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
const storage = new Storage({
  keyFilename: "./keyfile.json",
});
// const storage = new Storage({
//   projectId: process.env.GCS_PROJECT_ID,
//   credentials: {
//     client_email: process.env.GCS_CLIENT_EMAIL,
//     private_key: process.env.GCS_PRIVATE_KEY,
//   },
// });
const { ImageAnnotatorClient } = require("@google-cloud/vision");

// const client = new ImageAnnotatorClient({
//   credentials: {
//     client_email: process.env.GCS_CLIENT_EMAIL,
//     private_key: process.env.GCS_PRIVATE_KEY,
//   },
// });

const client = new ImageAnnotatorClient({
  keyFilename: "./keyfile.json",
});

const { v4: uuidv4 } = require("uuid");

const stripe = require("stripe")(process.env.REACT_APP_STRIPE_KEY);

const resolvers = {
  Query: {
    users: async () => {
      return User.find();
    },
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .populate("recentArt")
        .populate("favourites");
    },
    products: async () => {
      return Product.find();
    },
    product: async (parent, { productId }) => {
      return Product.findOne({ _id: productId });
    },
    orders: async () => {
      return Order.find();
    },
    order: async (parent, { orderId }) => {
      return Order.findOne({ _id: orderId });
    },
    me: async (parent, args, context) => {
      if (context.user) {
        const user = await User.findById(context.user._id)
          .populate({
            path: "orders",
            populate: {
              path: "items.product",
              model: "Product",
            },
          })
          .populate({
            path: "recentArt",
            model: "Product",
          })
          .populate({
            path: "favourites",
            populate: {
              path: "productId",
              model: "Product",
            },
          });
        return user;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    recentArt: async (parent, args, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("recentArt");
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    getFavourites: async (parent, { productID }, context) => {
      //if the user logged in
      if (context.user) {
        try {
          //find a favourite by the product _id
          const favourite = await Favourite.findOne({
            productId: productID,
            userId: context.user._id,
          });

          console.log(favourite);
          //if no favourite is found in the database return false
          if (!favourite) {
            return false;
          }
          //if a favourite is found in the database return trueq
          return true;
        } catch (err) {
          console.log(err);
        }
      }
    },
    searchArt: async (parent, { inputText }) => {
      const regex = new RegExp(`^${inputText}$`, "i");
      const search = await Product.find({ labels: { $regex: regex } });
      return search;
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user found with this email address");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect credentials");
      }

      const token = signToken(user);

      return { token, user };
    },
    createPaymentSession: async (
      parent,
      { items, successUrl, cancelUrl },
      context
    ) => {
      try {
        // Map through the items and create line items for each one
        const lineItems = items.map((item) => ({
          price_data: {
            currency: "gbp",
            product_data: {
              name: item._id,
              images: [item.imageUrl],
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        }));

        const basketItems = items.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          userId: context.user._id,
        }));

        const cart = JSON.stringify(basketItems);
        const customer = await stripe.customers.create({
          metadata: {
            userId: context.user._id,
            cart: cart,
          },
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card", "klarna"],
          billing_address_collection: "required",
          shipping_address_collection: { allowed_countries: ["GB"] },
          shipping_options: [
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 0, currency: "gbp" },
                display_name: "Free shipping",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 5 },
                  maximum: { unit: "business_day", value: 7 },
                },
              },
            },
            {
              shipping_rate_data: {
                type: "fixed_amount",
                fixed_amount: { amount: 1500, currency: "gbp" },
                display_name: "Next day air",
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 1 },
                  maximum: { unit: "business_day", value: 1 },
                },
              },
            },
          ],
          phone_number_collection: {
            enabled: true,
          },
          customer: customer.id,
          line_items: lineItems,
          mode: "payment",
          success_url: successUrl,
          cancel_url: cancelUrl,
        });

        return {
          id: session.id,
          url: session.url,
        };
      } catch (err) {
        console.log(err);
        throw new Error("Failed to create payment intent");
      }
    },
    createOrder: async (parent, { cart, details, cardInfo }) => {
      const products = JSON.parse(cart);

      console.log("resolvers", cardInfo);

      const items = products.map((item) => ({
        product: item.productId,
        quantity: item.quantity,
      }));

      const line1 = details.customer_details.address.line1;
      const line2 = details.customer_details.address.line2;
      const address = line2 ? `${line1}, ${line2}` : line1;

      const order = await Order.create({
        userId: details.userId,
        items: items,
        shipping: {
          city: details.customer_details.address.city,
          country: details.customer_details.address.country,
          address: address,
          postalCode: details.customer_details.address.postal_code,
        },
        cardDetails: {
          brand: cardInfo.brand,
          last4: cardInfo.last4,
          exp_month: cardInfo.exp_month,
          exp_year: cardInfo.exp_year,
        },
        phone: details.customer_details.phone,
        amount_shipping: details.amount_shipping,
        total: details.total,
      });

      //find the logged in user in the database and push the new favourite
      const user = await User.findOneAndUpdate(
        { _id: details.userId },
        {
          $push: {
            orders: {
              _id: order._id,
            },
          },
        },
        { new: true }
      ).populate("orders");

      return order;
    },
    addRecentArt: async (parent, { productName, imageUrl, price }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to perform this action"
        );
      }

      let productFound = await Product.findOne({ productName: productName });
      if (productFound) {
        const productUpdate = await Product.findOneAndUpdate(
          { productName: productName },
          { imageUrl: imageUrl, price: price },
          { new: true }
        );
        return productUpdate;
      }

      const product = await Product.create({
        productName,
        imageUrl,
        price,
      });

      try {
        // Find the user by ID and update their recentArt array
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { recentArt: product._id } },
          { new: true }
        ).populate("recentArt.product");

        return product;
      } catch (err) {
        console.error(err);
        throw new Error("Something went wrong");
      }
    },
    addProduct: async (parent, { productName, imageUrl, price }) => {
      try {
        let productFound = await Product.findOne({ productName: productName });
        if (productFound) {
          const productUpdate = await Product.findOneAndUpdate(
            { productName: productName },
            { imageUrl: imageUrl, price: price },
            { new: true }
          );
          return productUpdate;
        }

        const product = await Product.create({
          productName,
          imageUrl,
          price,
        });
        return product;
      } catch (err) {
        throw new Error("Something went wrong");
      }
    },
    addFavourite: async (parent, { productID }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to add favourites"
        );
      }
      try {
        ///find a product with the product id passed
        let productFound = await Product.findById(productID);

        if (!productFound) {
          throw new Error("Product not found");
        }

        let favouriteFound = await Favourite.findOne({
          productId: productID,
          userId: context.user._id,
        });

        if (favouriteFound) {
          throw new Error("Product already added to favourites");
        }

        //create a nwe favourite
        const favourite = await Favourite.create({
          productId: productFound._id,
          isFavourite: true,
          userId: context.user._id,
        });
        //find the logged in user in the database and push the new favourite
        const user = await User.findOneAndUpdate(
          { _id: context.user._id },
          {
            $push: {
              favourites: {
                _id: favourite._id,
              },
            },
          },
          { new: true }
        ).populate("favourites");

        return user;
      } catch (err) {
        console.error(err);
        throw new Error("Failed to add favorite product");
      }
    },
    removeFavourite: async (parent, { productID }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to remove favourites"
        );
      }

      try {
        ///find a product with the product name passed
        const product = await Product.findById(productID);

        if (!product) {
          throw new Error("Product not found");
        }
        //find a product with the product id and user _id
        const favourite = await Favourite.findOne({
          productId: product._id,
          userId: context.user._id,
        });

        if (!favourite) {
          throw new Error("Favourite not found");
        }

        const user = await User.findById(context.user._id);

        if (!user) {
          throw new Error("User not found");
        }
        //remove the favourite object with the favourite _id from the user's favourites array
        user.favourites = user.favourites.filter(
          (f) => f.toString() !== favourite._id.toString()
        );

        await favourite.remove();
        await user.save();

        return user;
      } catch (err) {
        console.error(err);
        throw new Error("Failed to remove favorite product");
      }
    },
    createProduct: async (parent, { artUrl, inputText, price }, context) => {
      try {
        const imageUrl = artUrl;
        // image extension
        const extension = ".jpg";
        //create a unique id for the image
        const uniqueId = uuidv4();
        //create a timestamp for the image
        const timestamp = Date.now();
        // create a file name for the image
        const fileName = `${timestamp}-${uniqueId}${extension}`;
        // google cloud storage bucket name
        const bucketName = "ai-commerce-analysis";
        // create a new file in the bucket
        const file = storage.bucket(bucketName).file(fileName);
        // fetch image data from the specified URL and store it in a stream
        const responseBucket = await axios.get(imageUrl, {
          responseType: "stream",
        });
        // create a writable stream for the image file with content type set to JPEG
        const writeStream = file.createWriteStream({
          contentType: "image/jpeg",
        });
        // pipe the data stream from the response to the write stream, and wait for it to finish
        await new Promise((resolve, reject) => {
          responseBucket.data.pipe(writeStream);
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });
        // call google cloud vision API to detect labels in the image
        // then sort the labels by score and extract only their description
        const [result] = await client.labelDetection(imageUrl);
        const labels = result.labelAnnotations
          ? result.labelAnnotations
              .sort((a, b) => b.score - a.score)
              .map((label) => label.description)
          : [];

        // Call Google Cloud Vision API to detect webentities in the image at imageUrl
        // Then sort the webentities by score and extract only their description
        const [result2] = await client.webDetection(imageUrl);
        const webEntities = result2.webDetection.webEntities
          ? result2.webDetection.webEntities
              .sort((a, b) => b.score - a.score)
              .map((webEntity) => webEntity.description)
          : [];
        // get the signed url from google cloud storage
        const [publicUrl] = await file.getSignedUrl({
          action: "read",
          expires: "03-17-2025",
        });
        // create a new product
        const product = await Product.create({
          productName: inputText,
          imageUrl: publicUrl,
          price: price,
          labels: labels,
          webEntities: webEntities,
        });
        // add the product to the user's recentArt array if the user is logged in
        if (context.user) {
          await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { recentArt: product._id } },
            { new: true }
          ).populate("recentArt.product");
        }
        return product;
      } catch (err) {
        console.error(err);
        throw new Error("Failed to get images");
      }
    },
  },
};

module.exports = resolvers;
