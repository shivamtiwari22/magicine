import User from "../src/models/adminModel/AdminModel.js";
import jwt from "jsonwebtoken";
import Roles from "../src/models/adminModel/RoleModel.js";
import handleResponse from "../config/http-response.js";

var checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      //  verify token
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = await User.findById(userID).select("-password");
      const role = await Roles.findOne({ user_id: req.user.id });

      if (!role || role.name !== "Admin") {
          handleResponse(401,"Unauthorized" ,{},res)
      }
      next();
    } catch (error) {
      handleResponse(401,"Unauthorized User" ,{},res)
    }
  }

  if (!token) {
      handleResponse(401,"Unauthorized User, No Token" ,{},res)
  }
};

export default checkUserAuth;
