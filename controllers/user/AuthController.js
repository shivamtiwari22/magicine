import User from "../../src/models/adminModel/AdminModel.js";
import Roles from "../../src/models/adminModel/RoleModel.js";
import handleResponse from "../../config/http-response.js";
// import twilio from "twilio";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validateFields from "../../config/validateFields.js";
dotenv.config();

function generateRandomPassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+[]{}|;:,.<>?";

  const allCharacters = uppercase + lowercase + numbers + special;
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allCharacters.length);
    password += allCharacters[randomIndex];
  }

  return password;
}

class AuthController {
  static login = async (req, res) => {
    const { phone_no } = req.body;
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = twilio(accountSid, authToken);
    try {
      const requiredFields = [{ field: "phone_no", value: phone_no }];

      const validationErrors = validateFields(requiredFields);

      if (validationErrors.length > 0) {
        return handleResponse(
          400,
          "Validation error",
          { errors: validationErrors },
          res
        );
      }

      const user = await User.findOne({ phone_number: phone_no });

      const Otp = Math.floor(100000 + Math.random() * 900000).toString();

      if (user) {
        // const sms = await client.messages.create({
        //   body: `Your Code for verification is ${Otp} Please enter this code to verify your Phone number. Do not share this code with anyone`,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: user.phone_number,
        // });

        user.otp = Otp;
        user.save();

        handleResponse(200, "OTP sent successfully", {}, res);
      } else {
        const salt = await bcrypt.genSalt(10);
        const password = generateRandomPassword();
        const hasPassword = await bcrypt.hash(password, salt);

        const create = new User({
          password: hasPassword,
          phone_number: phone_no,
          otp: Otp,
        });

        await create.save();

        const newRole = new Roles({
          user_id: create.id,
          name: "User",
        });

        newRole.save();

        // const sms = await client.messages.create({
        //   body: `Your Code for verification is ${Otp} Please enter this code to verify your Phone number. Do not share this code with anyone`,
        //   from: process.env.TWILIO_PHONE_NUMBER,
        //   to: create.phone_number,
        // });

        const token = jwt.sign(
          {
            userID: create._id,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" }
        );

        handleResponse(200, "OTP sent successfully", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static verify = async (req, res) => {
    const { otp, phone_no } = req.body;

    try {
      const requiredFields = [
        { field: "phone_no", value: phone_no },
        { field: "otp", value: otp },
      ];
      const validationErrors = validateFields(requiredFields);

      if (validationErrors.length > 0) {
        return handleResponse(
          400,
          "Validation error",
          { errors: validationErrors },
          res
        );
      }

      const user = await User.findOne({ phone_number: phone_no });

      if (!user) {
        handleResponse(404, "User Not Found", {}, res);
      }


      if (otp == user.otp) {
        const token = jwt.sign(
          {
            userID: user._id,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "2d" }
        );

        handleResponse(
          200,
          "Phone number verified successfully",
          { token: token },
          res
        );
      } else {
        handleResponse(400, "Incorrect Otp", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };
}

export default AuthController;