import express from "express";
import checkUserAuth from "../middlewares/user-auth-middleware.js";
import AuthController from "../controllers/user/AuthController.js";
import uploadProduct from "../middlewares/multer/ImageProduct.js";
import HomeController from "../controllers/user/HomeController.js";
import CartController from "../controllers/user/CartController.js";
import checkoutAuth from "../middlewares/checkout-middleware.js";
import OrderController from "../controllers/user/OrderController.js";
import GlobalSetting from "../controllers/admin/GlobalSettingController.js";
import HomePageController from "../controllers/admin/HomePageController.js";
import GoogleAuthController from "../controllers/user/GoogleController.js";
import passport from "passport";
import CustomerPolicyController from "../controllers/admin/CustomerSupportController.js";
const routers = express.Router();


// Open home apis 
routers.get('/single-medicine/:slug', HomeController.SingleMedicine);
routers.get('/all-medicine', HomeController.allMedicine);
routers.get("/get-menu", HomeController.GetMenu);
routers.get("/search-products", HomeController.SearchProducts);
routers.get("/search-auto-complete", HomeController.SearchAutoComplete);

routers.get("/search-by-category-brand", HomeController.SearchByCatBrand);
routers.get('/single-product/:slug', HomeController.SingleProduct);
routers.get('/single-surgical/:slug', HomeController.SingleSurgical);
routers.get('/single-category/:slug', HomeController.SingleCategory);
routers.get("/get-coupons", HomeController.GetCoupon);
routers.get("/get-sales-banner", HomeController.GetSalesBanner)
routers.get("/get-brands", HomeController.GetBrand)
routers.get("/get-categories", HomeController.GetCategories)
routers.get("/get-global", GlobalSetting.getGlobalSetting);
routers.get("/single-brand/:slug", HomeController.SingleBrand);
routers.get("/all-uses", HomeController.GetAllUses);
routers.get("/all-form", HomeController.GetAllForm);
routers.get("/get-home-page", HomePageController.GetHomePage)

routers.post("/add-address", checkUserAuth, AuthController.AddAddress)
routers.get("/all-addresses", checkUserAuth, AuthController.GetUserAllAddress)
routers.put("/update-address/:id", checkUserAuth, AuthController.UpdateUserAddress)
routers.delete("/delete-address/:id", checkUserAuth, AuthController.deleteUserAddress)








routers.get("/", async (req, res) => {
	res.send("hello user");
});

routers.use('/file', express.static('public/user/images'));
routers.use('/prescription', express.static('public/user/prescription'));
// unprotected routes 
routers.post("/login", AuthController.login)
routers.post("/verify", AuthController.verify)
routers.post("/resend-otp", AuthController.resendOtp)



// protected routes 
routers.get("/get-user", checkUserAuth, AuthController.getLoginUser);
routers.post("/update-profile", uploadProduct('public/user/images').single("profile_pic"), checkUserAuth, AuthController.updateProfile);
routers.get('/get-address', checkUserAuth, AuthController.userAddress)
routers.get('/add-update-address', checkUserAuth, AuthController.AddOrUpdateAddress)
routers.get("/all-prescription", checkUserAuth, AuthController.getPrescription)
routers.post("/upload-prescription", uploadProduct('public/user/prescription').single("file"), checkUserAuth, AuthController.uploadPrescription);
routers.get("/my-prescriptions", checkUserAuth, AuthController.myPrescriptions);

// cart 
routers.post("/add-cart",checkoutAuth ,CartController.AddCart);
routers.get("/remove-cart/:id",checkoutAuth , CartController.RemoveCart);
routers.post("/update-quantity", checkoutAuth ,CartController.UpdateQuantity);
routers.get("/get-cart",checkoutAuth,CartController.GetCart);

// Order 
routers.post("/place-order", checkUserAuth, OrderController.Checkout);
routers.get("/all-order", checkUserAuth, OrderController.MyOrders);
routers.get("/order-details/:id", checkUserAuth, OrderController.OrderDetails);
routers.get("/cancel-request", checkUserAuth, OrderController.CancelOrderReq);



// prescription 
routers.post("/post-prescription", checkUserAuth, CustomerPolicyController.postPrescription)




// google login 

routers.get("/google/login/success", GoogleAuthController.loginSuccess);
routers.get("/google/login/failed", GoogleAuthController.loginFailed);


routers.get("/google", passport.authenticate('google', {
	scope:
		['email', 'profile']
}));

routers.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: process.env.CLIENT_URL,
		failureRedirect: process.env.CLIENT_FAIL_URL,
	})
);


export default routers;