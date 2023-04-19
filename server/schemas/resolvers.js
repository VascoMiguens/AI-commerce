require("dotenv").config();
const { AuthenticationError } = require("apollo-server-express");
const { User, Product, Order, Favourite } = require("../models");
const { signToken } = require("../utils/auth");
const axios = require("axios");
const { Storage } = require("@google-cloud/storage");
// const storage = new Storage({
//   keyFilename: "../keyfile.json",
// });
const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY,
  },
});
const { ImageAnnotatorClient } = require("@google-cloud/vision");

const client = new ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY,
  },
});

// const client = new ImageAnnotatorClient({
//   keyFilename: "../keyfile.json",
// });

const { v4: uuidv4 } = require("uuid");

const stripe = require("stripe")(process.env.PRIVATE_API_KEY);

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
              path: "products.productId",
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
    getFavourites: async (parent, { productName }, context) => {
      //if the user logged in
      if (context.user) {
        try {
          //find a product by the product name
          const product = await Product.findOne({ productName: productName });
          console.log(product);
          //find a favourite by the product _id
          const favourite = await Favourite.findOne({ productId: product._id });
          //if no faourite is found in the database return false
          if (!favourite) {
            return false;
          }
          //find a user that has the favourite _id and the logged in user._id
          const user = await User.findOne({
            favourites: favourite._id,
            userId: context.user._id,
          });
          //if a user is found
          if (user) {
            return true;
          } else {
            return false;
          }
        } catch (err) {
          console.log(err);
        }
      }
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
    newOrder: async (
      parent,
      { customerName, customerAddress, items, total },
      context
    ) => {
      if (context.user) {
        const order = await Order.create({
          customerName,
          customerAddress,
          items,
          total,
        });

        await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { orders: order._id } }
        );

        return thought;
      }
      throw new AuthenticationError("You need to be logged in!");
    },
    checkout: async (parent, { amount }) => {
      // Other payment checks and vaalidations

      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount,
          currency: "gbp",
        });
        return {
          id: paymentIntent.id,
          client_secret: paymentIntent.client_secret,
        };
      } catch (error) {
        console.log(error);
        throw new AuthenticationError("Payment Failed!");
      }
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
    addFavourite: async (parent, { productName }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to add favourites"
        );
      }
      try {
        ///find a product with the product name passed
        let productFound = await Product.findOne({ productName: productName });

        if (!productFound) {
          throw new Error("Product not found");
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
    removeFavourite: async (parent, { productName }, context) => {
      if (!context.user) {
        throw new AuthenticationError(
          "You must be logged in to remove favourites"
        );
      }

      try {
        ///find a product with the product name passed
        const product = await Product.findOne({ productName });

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

        await user.save();
        await favourite.remove();

        return user;
      } catch (err) {
        console.error(err);
        throw new Error("Failed to remove favorite product");
      }
    },
    createProduct: async (parent, { inputText, price }, context) => {
      try {
        const text = inputText;

        // create a new image based on the user's input
        const response = await axios.post(
          "https://api.openai.com/v1/images/generations",
          {
            model: "image-alpha-001",
            prompt: `generate an image of ${text}`,
            num_images: 1,
            size: "1024x1024",
            response_format: "url",
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          }
        );

        const imageUrl = response.data.data[0].url;
        // image extension
        const extension = ".jpg";
        //create a unique id for the image
        const uniqueId = uuidv4();
        //create a timestamp for the image
        const timestamp = Date.now();
        // create a file name for the image
        const fileName = `${timestamp}-${uniqueId}${extension}`;
        // google cloud storage bucket name
        const bucketName = process.env.GCLOUD_STORAGE_BUCKET;
        // create a new file in the bucket
        const file = storage.bucket(bucketName).file(fileName);

        console.log(fileName);

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

        console.log(labels);

        // Call the Google Cloud Vision API to detect webentities in the image at imageUrl
        // Then sort the webentities by score and extract only their description
        const [result2] = await client.webDetection(imageUrl);
        const webEntities = result2.webDetection.webEntities
          ? 
            result2.webDetection.webEntities
              .sort((a, b) => b.score - a.score)
              .map((webEntity) => webEntity.description)
          : [];

        console.log(webEntities);

        // get the signed url from google cloud storage
        const [publicUrl] = await file.getSignedUrl({
          action: "read",
          expires: "03-17-2025",
        });

        console.log(publicUrl);

        // create a new product
        const product = await Product.create({
          productName: fileName,
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
