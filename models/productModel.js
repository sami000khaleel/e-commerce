const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  publisherId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  name: {
    type: String,
    required: true,
  },
  previousPrice: Number,
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  category: {
    type: String,
    required: true,
    enum: [
      "T-Shirt",
      "Shoes",
      "Shorts",
      "Shirt",
      "Pants",
      "Other",
      "Top",
      "Outwear",
      "Dress",
      "Body",
      "Longsleeve",
      "Undershirt",
      "Hat",
      "Blouse",
      "Hoodie",
      "Skip",
      "Blazer",
      "Skirt",
    ],
  },
  imagesUrls: [
    {
      type: String,
      required: true,
    },
  ],
  quantities: [
    {
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
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
