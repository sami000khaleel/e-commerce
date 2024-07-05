require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter=require('./routes/userRoutes')
// const productRouter=require('./routes/productRoutes')
async function createServer() {
  try {
    const app = express();
    app.use(cors({
      origin: "*"
    }));
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("connected to database");
    app.use(express.urlencoded({extended:true}))
    app.use(express.json())
    app.use('/api/user',userRouter)
    // app.use('/api/product',productRouter)
    const port = process.env.PORT_NUMBER || 3000;
    await app.listen(port);
    console.log("connected to server at port "+port);
  } catch (error) {
    console.error(error.message);
  }
}
createServer();
 