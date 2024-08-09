import crypto from "crypto";
import passport from "passport";
import User from "../../src/models/adminModel/AdminModel.js";
import bcrypt from "bcrypt";
import path from "path";
import jwt from "jsonwebtoken";
import handleResponse from "../../config/http-response.js";

import paypalClient from "../../config/paypalClient.js";

const { client, paypal } = paypalClient;

class GoogleAuthController {
  static loginSuccess = async (req, res) => {
    if (req.user) {
      try {
        const userData = req.user._json;

        console.log(userData);

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

        const user = {
          name: userData.name,
          email: userData.email,
        };

        return handleResponse(200, "Login successful", user, res);
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

  static Paypal = async (req, res) => {
    let request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      application_context: {
        return_url: `${process.env.BASE_URL}/api/user/paypal/success-payment`,
        cancel_url: `${process.env.BASE_URL}/api/user/cancel-payment`,
      },
      purchase_units: [
        {
          amount: {
            currency_code: req.body.currency,
            value: req.body.amount,
          },
        },
      ],
    });

    try {
      const order = await client().execute(request);
      if (order.result.id) {
        const approveLink = order.result.links.find(
          (link) => link.rel === "approve"
        );

        if (approveLink) {
          return res.json({
            success: true,
            message: "",
            url: approveLink.href,
          });
        }
      }
      return res.json({
        success: false,
        message: "Something went wrong.",
      });
    } catch (error) {
      console.error("Error creating PayPal order:", error);
      return res.json({
        success: false,
        message: "An error occurred while creating the PayPal order.",
      });
    }
  };

  static successPayment = async (req, res) => {
    
    const { token } = req.query;
    let request = new paypal.orders.OrdersCaptureRequest(token);
    request.prefer("return=representation");

    try {
      const response = await client().execute(request);

      if (response.result.status === "COMPLETED") {
        const transactionID = response.result.id;
        // Here you can handle the transactionID if needed

        // Redirect to the deposit fund page or send a success message
        console.log(transactionID);

        // return res.json({
        //   success: true,
        //   message: "ok",

        //   data: transactionID,
        // });

        res.redirect(`http://localhost:3000/cart/checkout?payment_id=${transactionID}`);  
      } else {
        // Handle other statuses if necessary
        return res.json({
          success: false,
          message: "Payment was not completed",
        });
        // res.redirect(`/deposit-fund?msg=Payment was not completed.`);
      }
    } catch (error) {
      console.error("Error capturing PayPal payment:", error);
      return res.json({
        success: false,
        message: error,
      });
    }
  };
}

export default GoogleAuthController;
