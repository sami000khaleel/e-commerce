const mongoose = require("mongoose");
const promoCodeSchema = new mongoose.Schema({
  expiryDate: { type: Date, required: true },
  code: { type: String, required: true },
  discount: { type: Number, required: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: () => Date.now() },
});
module.exports = mongoose.model("PromoCode", promoCodeSchema);
