import crypto from "crypto";
import passport from "passport";
import User from "../../src/models/adminModel/AdminModel.js";
import bcrypt from "bcrypt";
import path from "path";
import jwt from "jsonwebtoken";
import handleResponse from "../../config/http-response.js";


class GoogleAuthController {
    static loginSuccess = async (req, res) => {
      if (req.user) {
        try {
  
          const userData = req.user._json;
     
          console.log(userData.email);
  
        //   let user = await User.findOne({
        //       email: userData.email 
        //     });
  
        //     let randomWords = crypto.randomBytes(4).toString("hex");
        //     let password = crypto.randomBytes(8).toString("hex");
        //     const username = `${userData.given_name}${randomWords}`;
        //     const salt = await bcrypt.genSalt(10);
        //     const hasPassword = await bcrypt.hash(password, salt);
        //     if (!user) {
        //       user = new User({
        //         first_name: userData.given_name,
        //         last_name:userData.family_name,
        //         username,
        //         email : userData.email,
        //         device_id : userData.sub,
        //         password: hasPassword,
        //         is_verified:true
        //       });
        //       await user.save();
        //     }
      
        //     const token = jwt.sign(
        //       {
        //         userID: user._id,
        //       },
        //       process.env.JWT_SECRET_KEY,
        //       { expiresIn: "1d" }
        //     );
  
  
            return handleResponse(200, "Login successful", {}, res);
        } catch (e) {
          return handleResponse(500, e.message, {}, res);
        }
      } else {
        handleResponse(403, "Not Authorized", {}, res);
      }
    };
  
    static google = async (req, res) => {
      passport.authenticate("google", { scope: ["email", "profile"] });
    };
  
    static callBack = async (req, res) => {
      passport.authenticate("google", {
        successRedirect: process.env.CLIENT_URL,
        failureRedirect: "/login/failed",
      });
    };
  
    static loginFailed = async (req, res) => {
      handleResponse(401, "Login failure", {}, res);
    };
  }
  
  export default GoogleAuthController;
  