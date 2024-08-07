import User from "../src/models/adminModel/AdminModel.js";
import jwt from "jsonwebtoken";
import Roles from "../src/models/adminModel/RoleModel.js";
import handleResponse from "../config/http-response.js";

var checkoutAuth = async (req, res, next) => {
  let token;
  const { authorization, device } = req.headers;

  console.log(device);

  if (authorization) {
    try {
      token = authorization.split(" ")[1];
      const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // console.log(userID);
      req.user = await User.findById(userID).select("-password");
    } catch (err) {

      // return handleResponse(400, "Invalid Token", {}, res);
    }
  } else if (device && device != 'null') {
    req.device_id = device;
  } else {
    return handleResponse(400, "No token or device ID provided", {}, res);  
  }

  next();
};

export default checkoutAuth;
