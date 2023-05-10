const { Schema, model } = require("mongoose");
const dateFormat = require("../utils/dateFormat");

const orderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  items: [
    {
      product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
      quantity: {
        type: Number,
      },
    },
  ],
  shipping: [
    {
      city: { type: String, required: true },
      country: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, required: true },
    },
  ],
  phone: { type: String, required: true },
  amount_shipping: { type: Number, required: true },
  total: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => dateFormat(timestamp),
  },
});

const Order = model("Order", orderSchema);

module.exports = Order;
