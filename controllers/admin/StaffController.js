import { parse } from "dotenv";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Permission from "../../src/models/adminModel/PermissionModel.js";
import Roles from "../../src/models/adminModel/RoleModel.js";

class StaffController {

  //get all tag
  static allStaff = async (req, resp) => {
    try {

      //  getting staff user by lookup 
      const usersWithRoles = await User.aggregate([
        {
          $lookup: {
            from: "roles",
            localField: "id",
            foreignField: "user_id",
            as: "roles",
          },
        },
        {
          $unwind: "$roles",
        },
        {
          $match: {
            "roles.name": "Staff",
          },
        },

        {
          $lookup: {
            from: "permissions", // The name of the permissions collection
            localField: "id", // Field from the users collection
            foreignField: "user_id", // Field from the permissions collection
            as: "permissions", // The field to add the permissions array
          },
        },

        {
          $project: {
            _id: 1,
            id: 1,
            name: 1,
            email: 1,
            phone_number: 1,
            profile_pic: 1,
            roles: 1,
            dob: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: "$dob",
              },
            },
            createdAt: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      const usersWithFullProfilePicUrl = usersWithRoles.map(user => ({
        ...user,
        profile_pic: user.profile_pic ? `${req.protocol}://${req.get("host")}/${user.profile_pic}` : null,
      }));

      return handleResponse(
        200,
        "User fetched successfully.",
        usersWithFullProfilePicUrl,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static GetSingleStaff = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "Unauthorized User", {}, resp);
      }

      const { id } = req.params;

      let singleUser;
      const userData = await User.findOne({ id: id }).lean();

      if (!userData) {
        return handleResponse(404, "Not found", {}, resp);
      }

      if (userData.profile_pic) {
        userData.profile_pic = `${req.protocol}://${req.get("host")}/${userData.profile_pic}`;
      } else {
        userData.profile_pic = null;
      }

      const userRole = await Roles.findOne({ user_id: userData.id });
      if (userRole) {
        userData.role = userRole;
      }

      const userPermissions = await Permission.find({ user_id: userData.id }).lean();
      if (userPermissions.length > 0) {
        userData.user_permissions = userPermissions;
      }


      return handleResponse(200, "Staff Fetched Successfully.", userData, resp);
    } catch (err) {
      console.log("err", err);

      return handleResponse(500, err.message, {}, resp);
    }
  }

  static updateStaffPermission = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "unauthorizd User", {}, resp)
      }
      const { id } = req.params;

      const userData = req.body;

      const files = req.files;


      const existingUser = await User.findOne({ id: id })

      for (const key in userData) {
        if (Object.hasOwnProperty.call(userData, key)) {
          existingUser[key] = userData[key];
        }
      }

      if (files && files.profile_pic) {
        existingUser.profile_pic = files.profile_pic[0].path;
      }

      if (req.body.user_permission && req.body.user_permission.length > 0) {

        for (const item of JSON.parse(req.body.user_permission)) {
          const existingPermissions = await Permission.findOne({ user_id: id, model: item.name })
          if (!existingPermissions) {
            const newPermission = new Permission({
              user_id: id,
              model: item.name,
              Permission: item.permissions
            })

            await newPermission.save()
          }
          existingPermissions.Permission = item.permissions

          await existingPermissions.save()

        }
      }

      return handleResponse(200, "User Permissions Updated Successfully.", {}, resp)
    } catch (err) {
      console.log("err", err);

      return handleResponse(500, err.message, {}, resp)
    }
  }

}

export default StaffController;
