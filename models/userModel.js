const mongoose = require("mongoose");
const { throwError } = require("../errorHandler");

const userSchema = new mongoose.Schema({
  publishedProducts: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Product" }],
  personalImageUrl: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    default: "customer",
    emun: ["customer", "manager"],
  },
  addresses: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Address",
    },
  ],
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email address",
    ],
    unique: true,
  },
  paymentCards: [{ type: mongoose.SchemaTypes.ObjectId, ref: "PaymentCard" }],
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  verificationCodes: [
    {
      code: Number,
      createdAt: {
        requried: true,
        type: Date,
        default: ()=>Date.now(),
      },
    },
  ],
  reviews: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "Review",
    },
  ],
  favorites: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      savedAt: {
        type: Date,
        default: () => Date.now(),
      },
      size: {
        type: String,
        required: true,
        enum: ["xs", "s", "m", "l", "xl"],
      },
    },
  ],
  promoCodes: [{ type: mongoose.SchemaTypes.ObjectId, ref: "PromoCode" }],
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
});
userSchema.statics.findUserById=async function(id){
  const user=await this.findById(id).select('-password -verificationCodes')
}
userSchema.statics.findByEmail=async function(email){
  const user= await this.findOne({email}).select('-password -verificationCodes')
  if(!user)
    throwError('no user was found using this email',400)
  return user
}
userSchema.methods.checkCodeFrequency=async function(){
  if (!this.verificationCodes?.length) return true;
      let isAfter30Sec= Date.now() -
        this.verificationCodes[this.verificationCodes.length - 1].createdAt >30000
        
        if(!isAfter30Sec)
          throwError('you must wait atleast 30 seconds between each code request',400);
}
userSchema.methods.sanitizeUser= function(){
  let sanitizedUser=this.toObject()
  delete sanitizedUser.password
  delete sanitizedUser.verificationCodes
  return sanitizedUser
}
userSchema.methods.createVerificationCode=async function(){
  const code = Math.floor(Math.random()*1000000)
  this.verificationCodes.push({code})
  await this.save()
  return code
}
const User = mongoose.model("User", userSchema);

module.exports = User;
