import User from "../../src/models/adminModel/AdminModel.js";
import Roles from "../../src/models/adminModel/RoleModel.js";
import handleResponse from "../../config/http-response.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import UserAddress from "../../src/models/adminModel/UserAddressModel.js";
import { response } from "express";

class UserController {
  static addUser = async (req, resp) => {
    const {
      name,
      email,
      password,
      password_confirmation,
      phone_number,
      dob,
      profile_pic,
    } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      handleResponse(409, "Email already exists", {}, resp);
    } else {
      if (
        name &&
        password &&
        password_confirmation &&
        phone_number &&
        dob &&
        email
      ) {
        if (password === password_confirmation) {
          const salt = await bcrypt.genSalt(10);
          const hasPassword = await bcrypt.hash(password, salt);
          const profilePicturePath = req.file ? req.file.path : null;
          try {
            const doc = new User({
              name: name,
              email: email,
              password: hasPassword,
              phone_number: phone_number,
              dob: dob,
              profile_pic: profilePicturePath,
            });

            await doc.save();

            const newRole = new Roles({
              user_id: doc.id,
              name: "User",
            });

            newRole.save();

            const address = new UserAddress({
              user_id: doc._id,
              address_line_one: req.body.address_line_one,
              address_line_two: req.body.address_line_two,
              city: req.body.city,
              state: req.body.state,
              country: req.body.country,
              postal_code: req.body.postal_code,
            });

            address.save();

            const saveUser = await User.findOne({
              email: email,
            });

            const token = jwt.sign(
              {
                userID: saveUser._id,
              },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "1d" }
            );

            handleResponse(200, "User Add Successfully", doc, resp);
          } catch (error) {
            handleResponse(500, error.message, {}, resp);
          }
        } else {
          handleResponse(
            401,
            "Password & Confirm Password Does't Match",
            {},
            resp
          );
        }
      } else {
        handleResponse(400, "All fields are required", {}, resp);
      }
    }
  };

  static getAllUsers = async (req, res) => {
    try {
      const users = await UserAddress.find().populate("user_id");

      console.log(users);

      const excludeUserId = req.user.id;
      const formattedUsers = [];

      // Loop through each user to extract selected data
      users.forEach((user) => {
        const {
          name,
          email,
          dob,
          profile_pic,
          phone_number,
          createdAt,
          status,
        } = user.user_id;

        // Initialize imageName to null
        let imageName = null;

        // Extract image name if profile_pic exists
        if (profile_pic) {
          imageName = path.basename(profile_pic);
        }

        // Format date of birth and member since dates
        const newDOB = dob ? new Date(dob).toISOString().split("T")[0] : null;
        const memberSince = createdAt
          ? new Date(createdAt).toISOString().split("T")[0]
          : null;

        // Construct profile picture URL
        const profilePicURL = imageName
          ? `http://localhost:8000/uploads/${imageName}`
          : null;

        // Construct formatted user object with selected data

        const formattedUser = {
          name,
          email,
          dob: newDOB,
          phone_number,
          country: user.country,
          profile_pic: profilePicURL,
          member_since: memberSince,
          status,
        };

        // Push the formatted user data to the array
        formattedUsers.push(formattedUser);
      });

      handleResponse(200, "users get successfully", formattedUsers, res);
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static getUSerById = async (req, res) => {
    try {
      const id = req.params.id;
      const user = await User.findOne({ id: id });
      if (!user) {
        handleResponse(404, "Not Found", {}, res);
      }
      const user_address = await UserAddress.findOne({ user_id: user._id });

      const member_since = user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : null;
      const newDOB = user.dob
        ? new Date(user.dob).toISOString().split("T")[0]
        : null;

      let imageName = null;

      // Extract image name if profile_pic exists
      if (user.profile_pic) {
        imageName = path.basename(user.profile_pic);
      }

      const passUserData = {
        name: user.name,
        email: user.email,
        dob: newDOB,
        phone_number: user.phone_number,
        status: user.status,
        member_since: member_since,
        profile_pic: imageName
          ? `http://localhost:8000/uploads/${imageName}`
          : null,
      };

      let address = null;
      if (user_address) {
        address = user_address;
      }

      handleResponse(
        200,
        "get user data successfully",
        { user: passUserData, user_address: address },
        res
      );
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static updateUserProfile = async (req, resp) => {
    const { name, email, phone_number, dob, profile_pic } = req.body;
    const user = await User.findOne({ id: req.params.id });

    if (!user) {
      handleResponse(404, "Not Found", {}, resp);
    }
    if (name && phone_number && dob && email) {
      // const salt = await bcrypt.genSalt(10);
      // const hasPassword = await bcrypt.hash(password, salt);
      const profilePicturePath = req.file ? req.file.path : null;
      try {
        const doc = {
          name: name,
          dob: dob,
          profile_pic: profilePicturePath,
        };

        const updateUser = await User.findByIdAndUpdate(user._id, doc, {
          new: true,
        });

        const address = {
          address_line_one: req.body.address_line_one,
          address_line_two: req.body.address_line_two,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          postal_code: req.body.postal_code,
        };

        const updateAddress = await UserAddress.findOne({ user_id: user._id });
        Object.assign(updateAddress, address);

        // Save the updated user
        await updateAddress.save();

        handleResponse(200, "User Updated Successfully", doc, resp);
      } catch (error) {
        handleResponse(500, error.message, {}, resp);
      }
    } else {
      handleResponse(400, "All fields are required", {}, resp);
    }
  };
}

export default UserController;
