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
import TestimonialController from "../controllers/admin/TestimonialsController.js";
import ShippingController from "../controllers/admin/ShippingController.js";
import { disputesUpload, userPicUpload } from "./MulterRoutesSetting.js";
import AboutUsController from "../controllers/admin/AboutUsController.js";
import ContactUsController from "../controllers/admin/ContactUsController.js";
import CareerController from "../controllers/admin/CareerController.js";
import JobPositionController from "../controllers/admin/JobPostionController.js";
const routers = express.Router();

routers.get("/get-country-list", ShippingController.GetCountryList);
routers.post("/store-notfound", HomeController.StoreNotFoundSearch);

// Open home apis
routers.get("/single-medicine/:slug", checkoutAuth, HomeController.SingleMedicine);
routers.get("/all-medicine", checkoutAuth, HomeController.allMedicine);
routers.get("/get-menu", HomeController.GetMenu);
routers.get("/search-products", HomeController.SearchProducts);
routers.get("/search-auto-complete", HomeController.SearchAutoComplete);

routers.get("/search-by-category-brand", HomeController.SearchByCatBrand);
routers.get("/single-product/:slug", checkoutAuth, HomeController.SingleProduct);
routers.get("/single-surgical/:slug", checkoutAuth, HomeController.SingleSurgical);
routers.get("/single-category/:slug", HomeController.SingleCategory);
routers.get("/get-coupons", HomeController.GetCoupon);
routers.get("/get-sales-banner", HomeController.GetSalesBanner);
routers.get("/get-brands", HomeController.GetBrand);
routers.get("/get-categories", HomeController.GetCategories);
routers.get("/get-global", GlobalSetting.getGlobalSetting);
routers.get("/single-brand/:slug", HomeController.SingleBrand);
routers.get("/all-uses", HomeController.GetAllUses);
routers.get("/all-form", HomeController.GetAllForm);
routers.get("/get-recently-view", checkoutAuth, HomeController.RecentlyView);
routers.get("/get-home-page", checkoutAuth, HomePageController.GetHomePage);
routers.post("/add-address", checkUserAuth, AuthController.AddAddress);
routers.get("/all-addresses", checkUserAuth, AuthController.GetUserAllAddress);
routers.put("/update-address/:id", checkUserAuth, AuthController.UpdateUserAddress);
routers.delete("/delete-address/:id", checkUserAuth, AuthController.deleteUserAddress);
routers.post("/add-enquiry", CustomerPolicyController.addProductEnquiry);
routers.get("/get-about-us", AboutUsController.GetAboutUs);
routers.get("/get-contact-us", ContactUsController.getContactUs)
routers.get('/get-career', CareerController.getCareer)

// ---------------home-page-sections------------
routers.get('/get-home-page-section-three', checkoutAuth, HomeController.GetHomePageSectionThree)
routers.get('/get-home-page-section-six', checkoutAuth, HomeController.GetHomePageSectionSix)
routers.get('/get-home-page-section-twelve', checkoutAuth, HomeController.GetHomePageSectionTwelve)
routers.get('/get-home-page-section-thirteen', checkoutAuth, HomeController.GetHomePageSectionThirteen)
routers.get('/get-home-page-section-fourteen', checkoutAuth, HomeController.GetHomePageSectionFourteen)
routers.get('/get-home-page-section-fifteen', checkoutAuth, HomeController.GetHomePageSectionFifteen)
routers.get('/get-home-page-section-eighteen', checkoutAuth, HomeController.GetHomePageSectionEighteen)
routers.get('/get-home-page-section-nineteen', checkoutAuth, HomeController.GetHomePageSectionNineteen)
routers.get('/get-home-page-section-twenty', checkoutAuth, HomeController.GetHomePageSectionTwenty)
routers.get('/get-home-page-section-twentyone', checkoutAuth, HomeController.GetHomePageSectionTwentyOne)

//testimonials
routers.get("/get-testimonials", TestimonialController.GetTestimonial);

routers.post("/add-contact", CustomerPolicyController.addContact);

routers.get("/", async (req, res) => {
	res.send("hello user");
});

routers.use("/file", express.static("public/admin/images"));
routers.use("/prescription", express.static("public/user/prescription"));
// unprotected routes
routers.post("/login", AuthController.login);
routers.post("/verify", AuthController.verify);
routers.post("/resend-otp", AuthController.resendOtp);

// protected routes
routers.get("/get-user", checkUserAuth, AuthController.getLoginUser);
routers.post("/update-profile", uploadProduct("public/admin/images").single("profile_pic"), checkUserAuth, AuthController.updateProfile);
routers.get("/get-address", checkUserAuth, AuthController.userAddress);
routers.get("/add-update-address", checkUserAuth, AuthController.AddOrUpdateAddress);
routers.get("/all-prescription", checkUserAuth, AuthController.getPrescription);
routers.post("/upload-prescription", uploadProduct("public/user/prescription").single("file"), checkUserAuth, AuthController.uploadPrescription);
routers.get("/my-prescriptions", checkUserAuth, AuthController.myPrescriptions);
routers.put("/update-profile-pic", checkoutAuth, userPicUpload, AuthController.updateProfilePic)

// cart
routers.post("/add-cart", checkoutAuth, CartController.AddCart);
routers.get("/remove-cart/:id", checkoutAuth, CartController.RemoveCart);
routers.post("/update-quantity", checkoutAuth, CartController.UpdateQuantity);
routers.get("/get-cart", checkoutAuth, CartController.GetCart);
routers.post("/verify-coupon/:coupon", checkoutAuth, CartController.verifyCoupon);

// Order
routers.post("/place-order", checkUserAuth, OrderController.Checkout);
routers.get("/all-order", checkUserAuth, OrderController.MyOrders);
routers.get("/order-details/:id", checkUserAuth, OrderController.OrderDetails);
routers.get("/cancel-request", checkUserAuth, OrderController.CancelOrderReq);

//disputes
routers.post("/create-dispute", checkoutAuth, disputesUpload, OrderController.CreateDispute)
routers.get("/get-dispute/:id", checkoutAuth, OrderController.GetUserDisputes)
routers.post("/send-dispute-message", checkoutAuth, OrderController.sendMessage)
routers.get("/get-dispute-messages/:id", checkoutAuth, OrderController.GetAllMessages)
routers.put("/update-dispute-status/:id", checkoutAuth, OrderController.updateStatus)


// prescription
routers.post("/post-prescription", checkUserAuth, CustomerPolicyController.postPrescription);

//all career
routers.get("/all-position", JobPositionController.allPosition)
routers.get("/position-by-id/:id", JobPositionController.positionById)
routers.post("/post-application", uploadProduct('public/user/resume').single("resume"), JobPositionController.postApplication)

// google login

routers.get("/google/login/success", GoogleAuthController.loginSuccess);
routers.get("/google/login/failed", GoogleAuthController.loginFailed);

routers.get(
	"/google",
	passport.authenticate("google", {
		scope: ["email", "profile"],
	})
);

routers.get(
	"/google/callback",
	passport.authenticate("google", {
		successRedirect: process.env.CLIENT_URL,
		failureRedirect: process.env.CLIENT_FAIL_URL,
	})
);


routers.get('/facebook',
	passport.authenticate('facebook'));

routers.get(
	"/facebook/callback",
	passport.authenticate("facebook", {
		successRedirect: process.env.CLIENT_URL,
		failureRedirect: process.env.CLIENT_FAIL_URL,
	})
);

export default routers;
