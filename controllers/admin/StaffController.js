import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class StaffController {
  //get tag

  static allStaff = async (req, resp) => {
    try {
   
            //  getting staff user by lookup 
      const usersWithRoles = await User.aggregate([
        {
          $lookup: {
            from: "roles", // The name of the roles collection
            localField: "id", // Field from the users collection
            foreignField: "user_id", // Field from the roles collection
            as: "roles", // The field to add the roles array
          },
        },
        {
          $unwind: "$roles", // Unwind the roles array
        },
        {
          $match: {
            "roles.name": "Staff",
          },
        },
        {
          $sort: {
            createdAt: -1, // Sort by creation date in descending order
          },
        },
      ]);

      return handleResponse(
        200,
        "User fetched successfully.",
        usersWithRoles,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default StaffController;
