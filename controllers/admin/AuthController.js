import User from "../../src/models/adminModel/AdminModel.js";
import Roles from "../../src/models/adminModel/RoleModel.js";
import handleResponse from "../../config/http-response.js";
import bcrypt from "bcrypt";
import path from "path";
import jwt from "jsonwebtoken";
import transporter from "../../config/emailConfig.js";
import Permission from "../../src/models/adminModel/PermissionModel.js";

class AuthController {
  static userRegistration = async (req, res) => {
    try {
      const { name, email, password, password_confirmation, phone_number, dob } =
        req.body;

      const files = req.files;
      const user = await User.findOne({ email: email });
      if (user) {
        res.status(201).json({
          message: "Email already exists",
          status: false,
        });

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
            try {
              const doc = new User({
                name: name,
                email: email,
                password: hasPassword,
                phone_number: phone_number,
                dob: dob,
              });

              if (files && files.profile_pic) {
                doc.profile_pic = files.profile_pic[0].path
              }

              await doc.save();

              const newRole = new Roles({
                user_id: doc.id,
                name: "Staff",
              });

              newRole.save();


              if (req.body.user_permission.length > 0) {
                for (const item of JSON.parse(req.body.user_permission)) {
                  const permission = new Permission({
                    user_id: doc.id,
                    model: item.name,
                    Permission: item.permissions,
                  });

                  permission.save();
                }
              }


              const saveUser = await User.findOne({
                email: email,
              });

              const token = jwt.sign(
                {
                  userID: saveUser._id,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "2d" }
              );

              return handleResponse(201, "User Registered Successfully.", {}, res);
            } catch (error) {
              res.status(500).json({
                status: false,
                message: "",
              });
            }
          } else {
            res.json({
              message: "Password & Confirm Password Does't Match",
              status: false,
            });
          }
        } else {
          res.json({
            message: "All fields are required",
            status: false,
          });
        }
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, res)
    }
  };

  static adminLogin = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (email && password) {
        const user = await User.findOne({ email: email });

        if (user) {
          const role = await Roles.findOne({ user_id: user.id });
          if (role.name === "Admin" || role.name === "Staff") {
            const isMatch = await bcrypt.compare(password, user.password);
            if (email === user.email && isMatch) {
              // generate token
              const token = jwt.sign(
                {
                  userID: user._id,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: "2d" }
              );
              const allPermissions = await Permission.find({ user_id: user.id })
              let user_permissions = {};

              for (const item of allPermissions) {
                user_permissions[item.model] = item.Permission;
              }


              const userData = {
                token: token,
                role: role.name,
                permissions: user_permissions
              };

              handleResponse(200, "Login Success", userData, res);
            } else {
              handleResponse(401, "Invalid email or password", {}, res);
            }
          } else {
            handleResponse(404, "You are not a registered User", {}, res);
          }
        } else {
          handleResponse(404, "You are not a registered User", {}, res);
        }
      } else {
        handleResponse(400, "All fields are required", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static changePassword = async (req, res) => {
    try {
      const { password, password_confirmation } = req.body;
      if (password && password_confirmation) {
        if (password == password_confirmation) {
          const salt = await bcrypt.genSalt(10);
          const hasPassword = await bcrypt.hash(password, salt);

          await User.findByIdAndUpdate(req.user._id, {
            $set: {
              password: hasPassword,
            },
          });

          handleResponse(200, "Password Changed Successfully", {}, res);
        } else {
          handleResponse(
            400,
            "New password & confirm password does not match",
            {},
            res
          );
        }
      } else {
        handleResponse(400, "All fields are required", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static resetMail = async (req, res) => {
    const { email } = req.body;
    try {
      if (email) {
        const user = await User.findOne({ email: email });
        if (user) {
          const secret = user._id + process.env.JWT_SECRET_KEY;
          const token = jwt.sign({ userID: user._id }, secret, {
            expiresIn: "15m",
          });

          const link = `https://magicinepharma-dashboard.vercel.app/${user._id}/${token}`;

          try {
            let info = await transporter.sendMail({
              from: process.env.EMAIL_FROM, // sender address
              to: user.email, // list of receivers
              subject: "Magicine - Password Reset Link", // Subject line
              html: `<a href="${link}">Click Here</a> to Reset Your Password`, // html body
            });
          } catch (error) {
            handleResponse(500, error.message, {}, res);
          }

          handleResponse(200, "Reset MAil Send Successfully", link, res);
        } else {
          handleResponse(404, "User Not Found", {}, res);
        }
      } else {
        handleResponse(400, "Email is required", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static resetPassword = async (req, res) => {
    const { password, password_confirmation } = req.body;
    const { id, token } = req.params;
    const user = await User.findById(id);
    const new_secret = user._id + process.env.JWT_SECRET_KEY;
    try {
      jwt.verify(token, new_secret);
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          handleResponse(
            401,
            "New Password & Confirm New Password doesn't match",
            {},
            res
          );
        } else {
          const salt = await bcrypt.genSalt(10);
          const newHashPassword = await bcrypt.hash(password, salt);
          await User.findByIdAndUpdate(user._id, {
            $set: {
              password: newHashPassword,
            },
          });

          handleResponse(200, "Password Reset Successfully", {}, res);
        }
      } else {
        handleResponse(400, "All fields are required", {}, res);
      }
    } catch (error) {
      handleResponse(500, error.message, {}, res);
    }
  };

  static getLoginUser = async (req, res) => {
    try {
      const user = req.user;
      console.log("user", user);


      const { name, email, dob, profile_pic, phone_number } = user;

      let imageName = null;

      if (profile_pic) {
        imageName = path.basename(profile_pic);
      }

      const newDOB = dob ? new Date(dob).toISOString().split("T")[0] : null;

      const permission = await Permission.find({ user_id: user.id });

      const userPermissions = {};


      for (const item of permission) {
        userPermissions[item.model] = item.Permission;
      }


      const singleUserData = {
        name,
        email,
        dob: newDOB,
        phone_number,
        profile_pic: imageName
          ? `${req.protocol}://${req.get(
            "host"
          )}/public/admin/images/${imageName}`
          : null,
        userPermissions,
      };

      if (!user) {
        return handleResponse(500, "Something Went Wrong", {}, res);
      }
      return handleResponse(200, "user get successfully", singleUserData, res);
    } catch (error) {
      console.log("error", error);
      return handleResponse(500, error.message, {}, res);
    }
  };

  static updateProfile = async (req, resp) => {
    try {
      const profilePicturePath = req.file ? req.file.path : null;
      const existingData = await User.findOne({ _id: req.user._id });

      const updatedFields = {
        profile_pic: profilePicturePath || existingData.profile_pic || "",
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

      if (!updatedUser) {
        return handleResponse(404, "User not found", {}, resp);
      }

      return handleResponse(
        200,
        "Admin Profile updated successfully.",
        updatedUser,
        resp
      );
    } catch (error) {
      return handleResponse(500, error.message, {}, resp);
    }
  };
}

export default AuthController;
