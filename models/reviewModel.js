const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
  text: { type: String, required: true },
  rating: { type: Number, required: true, min: 0, max: 5 },
  userId: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  productId: { type: mongoose.SchemaTypes.ObjectId, ref: "Product" },
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  imagesUrls: [String],
});
module.exports = mongoose.model("Review", reviewSchema);
