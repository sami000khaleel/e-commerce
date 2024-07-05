const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  price: {
    totalPrice: { type: Number, required: true },
    orderPricePrePromoCode: { type: Number, required: true },
    orderPriceAfterPromoCode: { type: Number, required: true },
    deliveryPrice: { type: Number, required: true },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  deliveryMethod: {type:mongoose.SchemaTypes.ObjectId,ref:'DeliveryMethod'},
  products: [
    {
      price: {
        required: true,
        type: String,
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        size: {
          type: String,
          required: true,
          enum: ["xs", "s", "m", "l", "xl"],
        },
        quantity: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    },
  ],
  paymentCard: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "PaymentCard",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  deliveredAt:{
    type:Date,
  }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
