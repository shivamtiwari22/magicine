import User from "../../src/models/adminModel/AdminModel.js";
import Roles from "../../src/models/adminModel/RoleModel.js";
import handleResponse from "../../config/http-response.js";
import twilio from "twilio";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validateFields from "../../config/validateFields.js";
import moment from "moment";
import path from "path";
import UserAddress from "../../src/models/adminModel/UserAddressModel.js";
import PrescriptionRequest from "../../src/models/adminModel/PrescriptionRequestModel.js";
import MyPrescription from "../../src/models/adminModel/MyPrescriptionModel.js";
import Cart from "../../src/models/adminModel/CartModel.js";
import CartItem from "../../src/models/adminModel/CartItemModel.js";

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

async function updateCart(device_id, user_id) {
  // update cart
  await Cart.updateMany(
    { guest_user: device_id },
    { $set: { user_id: user_id } }
  );

  // update cartItem
  await CartItem.updateMany(
    { guest_user: device_id },
    { $set: { user_id: user_id } }
  );
}

class AuthController {
  static login = async (req, res) => {
    const { phone_no } = req.body;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);
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
        try {
          const sms = await client.messages.create({
            body: `Your Code for verification is ${Otp} Please enter this code to verify your Phone number. Do not share this code with anyone`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone_number,
          });
        } catch (e) {
          return handleResponse(400, "invalid phone number", {}, res);
        }

        user.otp = Otp;
        user.save();

        if (req.headers.device_id) {
          updateCart(req.headers.device_id, user.id)
        }

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

        try {
          const sms = await client.messages.create({
            body: `Your Code for verification is ${Otp} Please enter this code to verify your Phone number. Do not share this code with anyone`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: create.phone_number,
          });
        } catch (e) {
          return handleResponse(400, "invalid phone number", {}, res);
        }

        const token = jwt.sign(
          {
            userID: create._id,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "1d" }
        );

        if (req.headers.device_id) {
          updateCart(req.headers.device_id, create.id)
        }

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
        return  handleResponse(404, "User Not Found", {}, res);
      }

      if (otp == user.otp) {
        const token = jwt.sign(
          {
            userID: user._id,
          },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "2d" }
        );

     return    handleResponse(
          200,
          "Phone number verified successfully",
          { token: token },
          res
        );
      } else {
        return  handleResponse(400, "Incorrect Otp", {}, res);
      }
    } catch (error) {
      return  handleResponse(500, error.message, {}, res);
    }
  };

  static resendOtp = async (req, res) => {
    const { phone_no } = req.body;
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
        try {
          const sms = await client.messages.create({
            body: `Your Code for verification is ${Otp} Please enter this code to verify your Phone number. Do not share this code with anyone`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone_number,
          });
        } catch (e) {
          return handleResponse(400, "invalid phone number", {}, res);
        }

        user.otp = Otp;
        user.save();

        return handleResponse(200, "OTP sent successfully", {}, res);
      } else {
        return handleResponse(500, "Something went wrong", {}, res);
      }
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static getLoginUser = async (req, res) => {
    try {
      const user = req.user;

      const { name, email, dob, profile_pic, phone_number, createdAt } = user;

      // Initialize imageName to null
      let imageName = null;

      // Extract image name if profile_pic exists
      if (profile_pic) {
        imageName = path.basename(profile_pic);
      }

      const newDOB = dob ? new Date(dob).toISOString().split("T")[0] : null;

      const singleUserData = {
        name,
        email,
        dob: newDOB,
        phone_number,
        profile_pic: imageName
          ? `${req.protocol}://${req.get("host")}/api/user/uploads/${imageName}`
          : null,
        memberSince: moment(createdAt).format("DD-MM-YYYY"),
      };

      if (!user) {
        handleResponse(500, "Something Went Wrong", {}, res);
      }
      handleResponse(200, "user get successfully", singleUserData, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateProfile = async (req, res) => {
    try {
      const { name, email, country, state, postal_code, address_line } =
        req.body;
      const requiredFields = [
        { field: "name", value: name },
        { field: "email", value: email },
        { field: "country", value: country },
        { field: "state", value: state },
        { field: "postal_code", value: postal_code },
        { field: "address", value: address_line },
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

      const profilePicturePath = req.file ? req.file.path : null;

      const updatedFields = {
        profile_pic: profilePicturePath,
        name: req.body.name,
        phone_number: req.body.phone_number,
        dob: req.body.dob,
        email: req.body.email,
      };

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updatedFields,
        { new: true }
      );

      let setDefault = false;
      const existingAddress = await UserAddress.find({ user_id: req.user.id });

      if (existingAddress.length == 0) {
        setDefault = true;
      }

      const address = {
        address_line_one: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postal_code: req.body.postal_code,
        is_default: setDefault,
      };

      // Find the user's address
      let userAddress = await UserAddress.findOne({ user_id: req.user.id });

      if (!userAddress) {
        // If the address doesn't exist, create a new one
        userAddress = new UserAddress({ user_id: req.user.id, ...address });
      } else {
        // If the address exists, update it
        Object.assign(userAddress, address);
      }

      // Save the updated address
      await userAddress.save();

      if (!updatedUser) {
        return handleResponse(404, "User not found", {}, res);
      }

      return handleResponse(200, "Profile Updated", {}, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static userAddress = async (req, res) => {
    try {
      let user_id = req.user._id;
      const address = await UserAddress.find({ user_id: user_id });

      return handleResponse(200, "Address fetch successfully", address, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static getPrescription = async (req, res) => {
    try {
      let user_id = req.user.id;
      const users = await PrescriptionRequest.find({ user_id: user_id }).sort({
        id: -1,
      });

      return handleResponse(200, "fetch successfully", users, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static uploadPrescription = async (req, res) => {
    try {
      const user_id = req.user.id;
      const profilePicturePath = req.file ? req.file.path : null;

      const prescription = new MyPrescription({
        user_id: user_id,
        file: profilePicturePath,
      });
      await prescription.save();

      return handleResponse(200, "Prescription Uploaded Successfully", {}, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static myPrescriptions = async (req, res) => {
    try {
      let user_id = req.user.id;
      const users = await MyPrescription.find({ user_id: user_id })
        .lean()
        .sort({
          id: -1,
        });

      users.forEach((user) => {
        let imageName = null;
        // Extract image name if profile_pic exists
        if (user.file) {
          imageName = path.basename(user.file);
        }

        user.file = imageName
          ? `${req.protocol}://${req.get(
            "host"
          )}/api/user/prescription/${imageName}`
          : null;
      });

      return handleResponse(200, "fetch successfully", users, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static AddOrUpdateAddress = async (req, res) => {
    const {
      address_id,
      full_name,
      address_line_one,
      country,
      state,
      city,
      postal_code,
    } = req.body;
    try {
      const requiredFields = [
        { field: "full_name", value: full_name },
        { field: "address_line_one", value: address_line_one },
        { field: "country", value: country },
        { field: "state", value: state },
        { field: "city", value: city },
        { field: "postal_code", value: postal_code },
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

      const defaultAddress = await UserAddress.find({ user_id: req.user.id });
      const address = {
        address_line_one: req.body.address,
        landmark: req.body.landmark,
        full_name: req.body.full_name,
        phone_number: req.body.phone_number,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postal_code: req.body.postal_code,
        is_default: req.body.default,
      };

      if (address_id) {
        let updateAddress = await UserAddress.findOne({ id: address_id });
        Object.assign(updateAddress, address);
        await userAddress.save();
      } else {
        userAddress = new UserAddress({ user_id: req.user.id, ...address });
        await userAddress.save();
      }

      return handleResponse(201, "Address Updated Successfully", {}, res);
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };
}

export default AuthController;
