const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const authentication = require("../middlewares/authentication.js");
const { throwError, handleError } = require("../errorHandler.js");
const fs = require("fs");
const path = require('path');
const bcryptjs = require("bcryptjs");
const multer = require("multer");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const mongoose = require("mongoose");
class userController {
  constructor() {}
  static async updatePassword(req, res) {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const { userId } = await authentication.validateToken(token);
      let user = await User.findById(userId);
      if (!user) throwError("User not found", 404);
      const { oldPassword, newPassword } = req.body;
      if (!oldPassword || !newPassword)
        throwError("Please provide old and new password", 400);
      const sameOldPasswordFlag=await bcryptjs.compare(oldPassword,user.password)
      if(!sameOldPasswordFlag)throwError('old password is incorrect',400)
      if (oldPassword == newPassword)
        throwError("please choose a new password", 404);
      const hashedNewPassword=await authentication.hashPassword(newPassword)  
      user.password=hashedNewPassword
      await user.save()
      let sanitizedUser=user.sanitizeUser()
      return res.json({user:sanitizedUser})
    } catch (error) {
      handleError(error, res);
    }
  }
  static async resetPassword(req, res) {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      const { userId } = await authentication.validateToken(token);
  
      let user = await User.findById(userId).catch((err) =>
        throwError("no user was found", 404)
      );
  
      let { password } = req.body;
      if (!password) throwError("no password was sent", 400);
      if (password.length < 3)
        throwError("password should be at least 3 character long", 400);
      
      // Hash the new password
      let passwordsMatchFlag = await bcryptjs.compare(password, user.password);
      console.log(passwordsMatchFlag)
      if (passwordsMatchFlag) throwError('use a new password', 404);
      password = await authentication.hashPassword(password);
  
      // Directly compare the hashed passwords
  
      // Update user's password and save
      user.password = password;
      await user.save();
  
      return res.json({ success: true });
    } catch (err) {
      handleError(err, res);
    }
  }
  
  static async getCountries(req, res) {
    try {
      let file = await readFile("./countries_and_cities.json");
      file = JSON.parse(file);
      const countries = file.map((element) => element.country);
      return res.json({  countries });
    } catch (err) {
      handleError(err, res);
    }
  }

  static async getCities(req, res) {
    try {
      if (!req.query?.country) throwError("no country was sent", 400);
      let file = await readFile("./countries_and_cities.json");
      file = JSON.parse(file);
      const countryObj = file.filter(
        (elem) => elem.country === req.query.country
      );
      return res.json({  cities: countryObj[0].cities });
    } catch (err) {
      handleError(err, res);
    }
  }

  static async checkVerificationAccount(req, res) {
    try {
      const {code}=req.body
      if(!code)throwError('send the code please',400)
      const user = await User.findOne({email:req.body.email});
      if(!user)throwError('no one using this email was found',404)
      // if it is later than 30 seconds then deny
      await authentication.checkCodeAge(code,user);
      await authentication.checkIfCodeMatches(code, user);
      const token = authentication.createToken(user.id);
      let sanitizedUser=user.sanitizeUser()
      res.json({user:sanitizedUser, token });
    } catch (error) {
     handleError(error, res);
    }
  }
  static async createVerificationCode(req, res) {
    try {
      const user = await User.findOne({email:req.query?.email});
      if(!user)throwError('no user using this email was found',404)
      await user.checkCodeFrequency();
      const code = await user.createVerificationCode();
      await authentication.sendCode(user.email, code);
      return res.json({
        message: "your code has been sent successfully",
      });

    } catch (error) {
      handleError(error, res);
    }
  }
  static async loginUser(req, res) {
    try {
      let result = null;
      if (!req.body?.email || !req.body?.password)
        return res
          .status(400)
          .json({
            message: "You need to send your email and password",
          });

      const user = await User.findOne({email:req.body?.email});
      if (!user)
        return res
          .status(404)
          .json({  message: "Email is incorrect" });

      result = await authentication.verifyPassword(
        req.body?.password,
        user.password
      );
      if (!result)
        return res
          .status(400)
          .json({ message: "Password is incorrect" });

      const token = authentication.createToken(user.id);
      if (!token)
        return res
          .status(400)
          .json({message: "Failed creating the token" });

      // Exclude unnecessary fields from the user object
      let sanitizedUser=user.sanitizeUser()
      
      return res.json({ user:sanitizedUser, token });
    } catch (error) {
      handleError(error, res);
    }
  }

  static async createAccount(req, res) {
    try {
      // Generate a unique ID for the user using Mongoose ObjectId
      const userId = new mongoose.Types.ObjectId();

      // Set up the directory for the user's profile images
      const uploadDir = path.join(
        __dirname,
        "..",
        "profile-images",
        userId.toString()
      );
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Configure multer storage
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
          cb(null, `${Date.now()}-${userId.toString()}.jpg`);
        },
      });

      const upload = multer({ storage }).single("image");

      // Promisify the upload function and call it using await
      const uploadAsync = promisify(upload);
      await uploadAsync(req, res);

      const personalImagename = req.file.filename;
      const personalImageUrl = `/api/user/get-image?userId=${userId}&imageName=${personalImagename}`;
      
      req.body.personalImageUrl = personalImageUrl;

      // Assign the generated ObjectId to the user's _id field
      req.body._id = userId;

      // Validate user information
      await authentication.validateUserInfo(req.body);

      // Hash the password
      const hashedPassword = await authentication.hashPassword(
        req.body.password
      );
      req.body.password = hashedPassword;

      // Check if the email already exists
      await authentication.checkEmailExists(req.body.email);

      // Create the user in the database
      const user = await User.create(req.body);

      // Create a token for the user
      const token = await authentication.createToken(user.id);

      // Sanitize the user object for the response
      const sanitizedUser = {
        _id: user._id,
        name: user.name,
        personalImageUrl,
        email: user.email,
      };

      // Send the response
      return res.json({  user: sanitizedUser, token });
    } catch (err) {
      // Handle errors
      handleError(err, res);
    }
  }
  static async validateToken(req, res) {
    try {
      const token = req.headers["authorization"].split(" ")[1];
      console.log(token)
      await authentication.validateToken(token);
      return res.json({ success: true });
    } catch (error) {
      handleError(error, res);
    }
  }
}
module.exports = userController;
