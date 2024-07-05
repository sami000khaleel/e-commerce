const mongoose = require('mongoose');
const deliveryMethodSchema=new mongoose.Schema({
    name:{type:String,required:true},
    logoUrl:{type:String,required:true},
    duration:{type:String,required:true},
    price:{type:Number,required:true}
})
module.exports=mongoose.model('DeliveryMethod',deliveryMethodSchema)