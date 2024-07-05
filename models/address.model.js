const mongoose = require("mongoose");
const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  city: {
    required: true,
    type: String,
  },
  Region: {
    type: String,
  },
  zipCode: String,
  country: { type: String, required: true },
});
module.exports=mongoose.model('Address',addressSchema)