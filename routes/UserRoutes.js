import express from "express";
import checkUserAuth from "../middlewares/user-auth-middleware.js";
const routers = express.Router();



routers.get("/", async(req,res) => {
       res.send("hello user");
});



export default routers;