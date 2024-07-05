const nodemailer = require('nodemailer');
const User = require("../models/userModel.js");
const axios = require("axios");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { throwError } = require('../errorHandler.js');
class authentication {
  constructor() {}
  static async createVerificationCode(user){
    try
    {
      const code = Math.floor(Math.random()*1000000)
      user.verificationCodes.push({code})
      await user.save()
      return code
    }
    catch(error){
      console.log(error)
      throw error
    }
  }
  static async checkIfCodeMatches(code, user) {
    try {
      const lastVerificationCode = user.verificationCodes[user.verificationCodes.length - 1];
  
      if (!lastVerificationCode || lastVerificationCode.code != code) {
        throwError( "Invalid verification code",400 );
        
      }
  
      return "Verification code matched successfully";
    } catch (error) {
      console.error(error,'a');
      throw error
    }
  }
  
  static async checkCodeAge(code,user)
  {
    console.log(user.verificationCodes.length)
     const timeGapSeconds=Date.now()- user.verificationCodes[user.verificationCodes.length-1].createdAt
      console.log(timeGapSeconds)
     if(timeGapSeconds>60000)
        throwError(`you have to type the code within 60 seconds from recieving it.`,400)

  }
  static async sendCode(email,code){
    try{
      console.log(process.env.UESR_NAME)
      const transporter=nodemailer.createTransport({
        service:'gmail',
        auth:{
        user:process.env.UESR_NAME,
        pass:process.env.APP_PASSWORD
      }
    })
    const mailOptions={
      from:process.env.EMAIL,
      to:email,
      subject:'ai commerce account recovery',
      text:`your verification code is : ${code}`
    }
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);

  }
  
  catch(error){
    console.error(error)
    throw error
  }
}
 
  static async verifyPassword(sentPassword, password) {
    try {
      const res = await bcryptjs.compare(sentPassword, password);
      return res;
    } catch (error) {
      console.error(error);
      throwError('incorrect password',400)
    }
  }
  static createToken(userId) {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
  expiresIn:'1w'
    });
    return token;
  }
  static async checkCityExists(city) {
    try {
      const response = await axios.get(
        `https://api.example.com/cities?name=${city}`
      );
      const cities = response.data;

      // Check if the city exists in the response
      const cityExists = cities.some(
        (c) => c.name.toLowerCase() === city.toLowerCase()
      );

      return cityExists;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  static async checkEmailExists(email) {
      const existingUser = await User.findOne({ email });
      if(existingUser?.id)
          throwError('this email is already taken try another one',400)
  }

  static async hashPassword(password) {
    try {
      // Hash the password
      const hashedPassword = await bcryptjs.hash(password, 10);
      return hashedPassword;
    } catch (error) {
        throwError("error while dealing with you`r password")
    }
  }
  static async validateUserInfo({name,email,password}) {
    try {
      // Validate user information here
      if (!name || !email || !password) {
      throwError('please enter all the required information',400)
      }
      let res=await User.find({name})
      if(res?.length) throwError('this name is already taken, try another one',400)
      // Validate password length
      if (password.length < 3) {
          return throwError('password should be at least 3 characters long',400)
      }

      // Return the validated user information with the hashed password
      return {
        name,
        email,
        password,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  static async validateToken(token) {
    if (!token) {
      throwError('no token was provided', 400);
    }
    console.log(token)
    // Decode the token to check the expiration time
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      throwError('invalid token', 400);
    }
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded?.payload?.exp && decoded.payload.exp < currentTime) {
      throwError('token is expired', 401);
    }
    // Verify the token
    const result = await jwt.verify(token, process.env.JWT_SECRET);
    return result;
  }
}
module.exports = authentication;
