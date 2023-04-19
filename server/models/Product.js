const { Schema, model } = require("mongoose");
const dateFormat = require("../utils/dateFormat");

const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  labels: {
    type: [String],
    required: true,
  },
  webEntities: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => dateFormat(timestamp),
  },
});

const Product = model("Product", productSchema);

module.exports = Product;
