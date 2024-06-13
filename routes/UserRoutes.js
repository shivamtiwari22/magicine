import express from "express";
import checkUserAuth from "../middlewares/user-auth-middleware.js";
import AuthController from "../controllers/user/AuthController.js";
import uploadProduct from "../middlewares/multer/ImageProduct.js";
import HomeController from "../controllers/user/HomeController.js";






const routers = express.Router();


// Open home apis 
routers.get('/single-medicine/:slug', HomeController.SingleMedicine);
routers.get('/all-medicine', HomeController.allMedicine);
routers.get("/get-menu", HomeController.GetMenu);
routers.get("/search-products", HomeController.SearchProducts);
routers.get("/search-by-category-brand", HomeController.SearchByCatBrand);
routers.get('/single-product/:slug', HomeController.SingleProduct);
routers.get('/single-surgical/:slug', HomeController.SingleSurgical);
routers.get('/single-category/:slug', HomeController.SingleCategory);
routers.get("/get-coupons",HomeController.GetCoupon);












routers.get("/", async(req,res) => {
       res.send("hello user");
});

routers.use('/file', express.static('public/user/images'));
// unprotected routes 
routers.post("/login",AuthController.login)
routers.post("/verify",AuthController.verify)
routers.post("/resend-otp",AuthController.resendOtp)



// protected routes 
routers.get("/get-user", checkUserAuth , AuthController.getLoginUser);
routers.post("/update-profile",uploadProduct('public/user/images').single("profile_pic"),checkUserAuth,AuthController.updateProfile);
routers.get('/get-address',checkUserAuth , AuthController.userAddress)





export default routers;