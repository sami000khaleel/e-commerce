const mongoose = require("mongoose");
const paymentCardSchema = new mongoose.Schema({
  owner: { type: mongoose.SchemaTypes.ObjectId, ref: "User" },
  name: { type: String, required: true },
  cvv: {
    type: Number,
    requried: true,
  },
  expiryDate: { type: String, required: true },
  cardNumber: { type: Number, required: true },
  defaultCardFlag: { type: Boolean, required: true, default: false },
  createdAt:{type:Date,default:()=>Date.now()}
});
module.exports = mongoose.model("paymentCard", paymentCardSchema);
