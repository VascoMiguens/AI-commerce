const { Schema, model } = require("mongoose");
const dateFormat = require("../utils/dateFormat");

const orderSchema = new Schema({
  customerName: {
    type: String,
    required: "The Customer name is required",
    minlength: 1,
    maxlength: 280,
    trim: true,
  },
  customerAddress: {
    type: String,
    required: "The Address name is required",
    minlength: 1,
    maxlength: 280,
    trim: true,
  },
  total: {
    type: Number,
    required: true,
    trim: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
    get: (timestamp) => dateFormat(timestamp),
  },
});

const Order = model("Order", orderSchema);

module.exports = Order;
