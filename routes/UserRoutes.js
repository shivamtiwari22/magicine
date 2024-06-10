import express from "express";
import checkUserAuth from "../middlewares/user-auth-middleware.js";
import AuthController from "../controllers/user/authController.js";
import uploadProduct from "../middlewares/multer/ImageProduct.js";



const routers = express.Router();


routers.get("/", async(req,res) => {
       res.send("hello user");
});
routers.use('/file', express.static('public/user/images'));

// unprotected routes 
routers.post("/login",AuthController.login)
routers.post("/verify",AuthController.verify)

// protected routes 
routers.get("/get-user", checkUserAuth , AuthController.getLoginUser);
routers.post("/update-profile",uploadProduct('public/user/images').single("profile_pic"),checkUserAuth,AuthController.updateProfile);








export default routers;