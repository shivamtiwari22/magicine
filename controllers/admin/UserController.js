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
import validateFields from "../../config/validateFields.js";

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


    const requiredFields = [
      { field: "name", value: name },
      { field: "phone_number", value: phone_number },
      { field: "password", value: password },
      { field: "password_confirmation", value: password_confirmation },
      { field: "email", value: email },
      { field: "gender", value: gender },
    ];
    const validationErrors = validateFields(requiredFields);

    if (validationErrors.length > 0) {
      return handleResponse(
        400,
        "Validation error",
        { errors: validationErrors },
        resp
      );
    }


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
      const { name, email, country, fromDate, toDate } = req.query;

      const users = await User.find(
        {},
        "id name email phone_number dob profile_pic gender status createdAt country"
      )
        .lean()
        .sort({ id: -1 });

      for (const user of users) {
        const role = await Roles.findOne({ user_id: user.id }).lean();
        user.role = role ? role.name : null;

        const address = await UserAddress.findOne({ user_id: user.id }).lean();
        user.user_address = address;

        let imageName = null;
        if (user.profile_pic) {
          imageName = path.basename(user.profile_pic);
        }

        const memberSince = user.createdAt
          ? new Date(user.createdAt).toISOString().split("T")[0]
          : null;

        const profilePicURL = imageName
          ? `${req.protocol}://${req.get("host")}/public/admin/images/${imageName}`
          : null;

        user.profile_pic = profilePicURL;
        user.member_since = memberSince;
      }

      const firstFilter = users.filter(item => item.role === "User")

      const filteredUsers = firstFilter.filter((user) => {
        let matches = true;

        if (name) matches = matches && new RegExp(name, "i").test(user.name);
        if (email) matches = matches && new RegExp(email, "i").test(user.email);
        if (country)
          matches = matches && new RegExp(country, "i").test(user?.user_address?.country);
        if (fromDate && toDate) {
          const createdAt = moment(user.member_since, "YYYY-MM-DD");
          const from = moment(fromDate, "YYYY-MM-DD").startOf("day");
          const to = moment(toDate, "YYYY-MM-DD").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      handleResponse(200, "Users fetched successfully", filteredUsers, res);
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


      let imageName = null;

      // Extract image name if profile_pic exists
      if (user.profile_pic) {
        imageName = path.basename(user.profile_pic);
      }

      const passUserData = {
        name: user.name,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        phone_number: user.phone_number,
        status: user.status,
        member_since: member_since,
        profile_pic: imageName
          ? `${req.protocol}://${req.get("host")}/public/admin/images/${imageName}`
          : null,
      };

      let address = null;
      if (user_address) {
        address = user_address;
      }

      return handleResponse(
        200,
        "get user data successfully",
        { user: passUserData, user_address: address },
        res
      );
    } catch (error) {
      return handleResponse(500, error.message, {}, res);
    }
  };

  static updateUserProfile = async (req, resp) => {
    try {
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
        return;
      }


      const salt = await bcrypt.genSalt(10);
      const hasPassword = password ? await bcrypt.hash(password, salt) : null;
      const newPass = password ? hasPassword : user.password;

      let profilePicturePath = user.profile_pic;

      if (req.file) {
        profilePicturePath = req.file.path;
      }


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
      delete updatedUserObj.password;

      const address = {
        address_line_one: req.body.address_line_one,
        address_line_two: req.body.address_line_two,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        postal_code: req.body.postal_code,
      };

      let userAddress = await UserAddress.findOne({ user_id: user.id });

      if (!userAddress) {
        userAddress = new UserAddress({ user_id: user._id, ...address });
      } else {
        Object.assign(userAddress, address);
      }

      await userAddress.save();

      handleResponse(200, "User Updated Successfully", updatedUserObj, resp);
    } catch (error) {
      handleResponse(500, error.message, {}, resp);
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
