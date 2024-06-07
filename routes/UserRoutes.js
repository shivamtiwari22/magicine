import express from "express";
import checkUserAuth from "../middlewares/user-auth-middleware.js";
import AuthController from "../controllers/user/authController.js";

const routers = express.Router();



routers.get("/", async(req,res) => {
       res.send("hello user");
});

routers.post("/login",AuthController.login)
routers.post("/verify",AuthController.verify)





export default routers;