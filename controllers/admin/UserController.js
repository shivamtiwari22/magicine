import User from "../../src/models/adminModel/AdminModel.js";
import Roles from "../../src/models/adminModel/RoleModel.js";
import handleResponse from "../../config/http-response.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import UserAddress from "../../src/models/adminModel/UserAddressModel.js";
import fs from "fs";
import { format } from "@fast-csv/format";
import moment from "moment";
import { log } from "console";

class UserController {
  static addUser = async (req, resp) => {
    const {
      name,
      email,
      password,
      password_confirmation,
      phone_number,
      dob,
      gender,
      profile_pic,
      status,
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
        email &&
        gender
      ) {
        if (password === password_confirmation) {
          const salt = await bcrypt.genSalt(10);
          const hasPassword = await bcrypt.hash(password, salt);
          const profilePicturePath = req.file ? req.file.path : null;
          try {
            const doc = new User({
              name: name,
              email: email,
              gender: gender,
              password: hasPassword,
              phone_number: phone_number,
              dob: dob,
              status: status,
              profile_pic: profilePicturePath,
            });

            await doc.save();

            const newRole = new Roles({
              user_id: doc.id,
              name: "User",
            });

            newRole.save();

            const address = new UserAddress({
              user_id: doc.id,
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
      // parse  query parameters
      const { name, email, country, fromDate, toDate } = req.query;

      const users = await UserAddress.find()
        .populate("user_id")
        .sort({ id: -1 });

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
          gender,
          createdAt,
          status,
          _id,
          id,
        } = user.user_id;

        // Initialize imageName to null
        let imageName = null;

        // Extract image name if profile_pic exists
        if (profile_pic) {
          imageName = path.basename(profile_pic);
        }

        // Format date of birth and member since dates
        // const newDOB = dob ? new Date(dob).toISOString().split("T")[0] : null;
        const memberSince = createdAt
          ? new Date(createdAt).toISOString().split("T")[0]
          : null;

        // Construct profile picture URL
        const profilePicURL = imageName
          ? `${req.protocol}://${req.get("host")}/api/admin/file/${imageName}`
          : null;

        // Construct formatted user object with selected data

        const formattedUser = {
          _id,
          name,
          email,
          dob,
          phone_number,
          gender,
          country: user.country,
          profile_pic: profilePicURL,
          member_since: memberSince,
          status,
          id,
        };

        // Push the formatted user data to the array
        formattedUsers.push(formattedUser);
      });

      // Apply filters to the formatted users
      const filteredUsers = formattedUsers.filter((user) => {
        let matches = true;

        if (name) matches = matches && new RegExp(name, "i").test(user.name);
        if (email) matches = matches && new RegExp(email, "i").test(user.email);
        if (country)
          matches = matches && new RegExp(country, "i").test(user.country);
        if (fromDate && toDate) {
          const createdAt = moment(user.member_since, "YYYY-MM-DD");
          const from = moment(fromDate, "YYYY-MM-DD").startOf("day");
          const to = moment(toDate, "YYYY-MM-DD").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      handleResponse(200, "users get successfully", filteredUsers, res);
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
      const user_address = await UserAddress.findOne({ user_id: user.id });

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
        gender: user.gender,
        dob: newDOB,
        phone_number: user.phone_number,
        status: user.status,
        member_since: member_since,
        profile_pic: imageName
          ? `${req.protocol}://${req.get("host")}/api/admin/file/${imageName}`
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
    const {
      name,
      email,
      phone_number,
      dob,
      profile_pic,
      status,
      password,
      gender,
    } = req.body;
    const user = await User.findOne({ id: req.params.id });

    if (!user) {
      handleResponse(404, "Not Found", {}, resp);
    }

    if (name && phone_number && email) {
      const salt = await bcrypt.genSalt(10);
      const hasPassword = password ? await bcrypt.hash(password, salt) : null;
      const newPass = password ? hasPassword : user.password;
      const profilePicturePath = req.file ? req.file.path : null;
      try {
        const doc = {
          name: name,
          dob: dob,
          profile_pic: profilePicturePath,
          status: status,
          password: newPass,
          gender: gender,
        };

        const updateUser = await User.findByIdAndUpdate(user._id, doc, {
          new: true,
        });

        const updatedUserObj = updateUser.toObject();
        // Remove the password field
        delete updatedUserObj.password;

        const address = {
          address_line_one: req.body.address_line_one,
          address_line_two: req.body.address_line_two,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          postal_code: req.body.postal_code,
        };

        // Find the user's address
        let userAddress = await UserAddress.findOne({ user_id: user.id });

        if (!userAddress) {
          // If the address doesn't exist, create a new one
          userAddress = new UserAddress({ user_id: user._id, ...address });
        } else {
          // If the address exists, update it
          Object.assign(userAddress, address);
        }

        // Save the updated address
        await userAddress.save();

        handleResponse(200, "User Updated Successfully", updatedUserObj, resp);
      } catch (error) {
        handleResponse(500, error.message, {}, resp);
      }
    } else {
      handleResponse(400, "All fields are required", {}, resp);
    }
  };

  static csv = async (req, res) => {
    try {
      const userRoles = await Roles.find({ name: "User" });
      const userIds = userRoles.map((role) => role.user_id);

      const users = await User.find(
        { id: { $in: userIds } },
        "id name email phone_number createdAt status gender"
      ); // Fetch all users from the database

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No users found" });
      }

      // Fetch all user addresses
      const userAddresses = await UserAddress.find({}, "user_id country");

      // Create a map to quickly lookup country by user_id
      const addressMap = userAddresses.reduce((acc, address) => {
        acc[address.user_id] = address.country;
        return acc;
      }, {});

      const csvStream = format({
        headers: [
          "Id",
          "Name",
          "Email",
          "Gender",
          "Phone Number",
          "Country",
          "Member Since",
          "Status",
        ],
      });
      const writableStream = fs.createWriteStream("users.csv");

      writableStream.on("finish", () => {
        res.download("users.csv", "users.csv", (err) => {
          if (err) {
            console.error("Error downloading file:", err);
            handleResponse(500, err, {}, res);
          }
        });
      });

      csvStream.pipe(writableStream);

      users.forEach((user) => {
        const country = addressMap[user._id] || "N/A";
        csvStream.write({
          Id: user.id,
          Name: user.name,
          Email: user.email,
          Gender: user.gender,
          "Phone Number": user.phone_number,
          Country: country,
          "Member Since": moment(user.createdAt).format("DD-MM-YYYY"),
          Status: user.status,
        });
      });

      csvStream.end();
    } catch (error) {
      console.error("Error exporting users to CSV:", error);
      handleResponse(500, error.message, {}, res);
    }
  };
}

export default UserController;
