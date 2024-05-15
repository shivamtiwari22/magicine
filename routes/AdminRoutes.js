import express from "express";
import AuthController from "../controllers/admin/AuthController.js";
import checkUserAuth from "../middlewares/admin-auth-middleware.js";
import TagController from "../controllers/admin/TagController.js";
import CategoryController from "../controllers/admin/CategoryController.js";
import MarketerController from "../controllers/admin/MarketerController.js";
import ReviewController from "../controllers/admin/ReviewController.js";
import CouponsController from "../controllers/admin/CouponController.js"; 
import ProductController from "../controllers/admin/ProductController.js";
import BrandController from "../controllers/admin/BrandController.js";
import { multipleBrandUploads, multipleCategoryUploads, multipleProductUploads } from "./MulterRoutesSetting.js";


  

// import UploadProduct from "../middlewares/multer/ImageProduct.js";

import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import uploadProduct from "../middlewares/multer/ImageProduct.js";
import UserController from "../controllers/admin/UserController.js";
import CustomField from "../controllers/admin/CustomField.js";



const routers = express.Router();


// Protected Routes
routers.use("/get-user", checkUserAuth);
routers.use("/change-password", checkUserAuth);
// routers.use('/uploads', express.static('public/images'));
routers.use('/uploads', express.static(path.join(__dirname, 'public/images')));
// routers.use(express.static('public'));



// Open routes
routers.post("/register", AuthController.userRegistration);
routers.post("/login", AuthController.adminLogin);
routers.get("/get-user", AuthController.getLoginUser);
routers.get("/change-password", AuthController.changePassword);
routers.post("/send-reset-email", AuthController.resetMail);
routers.post("/reset-password/:id/:token", AuthController.resetPassword);
routers.post("/update-profile",uploadProduct('public/images').single("profile_pic"),checkUserAuth,AuthController.updateProfile);


// user 
routers.post("/add-user",uploadProduct('public/images').single("profile_pic"),checkUserAuth,UserController.addUser);
routers.get("/get-all-users", checkUserAuth ,UserController.getAllUsers);
routers.get("/user-by-id/:id", checkUserAuth ,UserController.getUSerById);
routers.post("/update-user/:id", uploadProduct('public/images').single("profile_pic"), checkUserAuth ,UserController.updateUserProfile);

// Custom Fields 
routers.post("/add-custom-field", checkUserAuth ,CustomField.addCustom);






// tags
routers.post("/add-tags", checkUserAuth, TagController.AddTag);
routers.get("/get-tags", TagController.GetTags);
routers.put("/update-tags/:id", checkUserAuth, TagController.updateTag);
routers.delete("/delete-tags/:id", checkUserAuth, TagController.deleteTag);

// category
routers.post("/add-category",multipleCategoryUploads, checkUserAuth, CategoryController.AddCategory);
routers.get("/get-category", CategoryController.GetCategories);
routers.get("/get-category/:id", CategoryController.GetCategoryById);
routers.put("/update-category/:id",multipleCategoryUploads,checkUserAuth,CategoryController.UpdateCategory);
routers.delete("/delete-category/:id",checkUserAuth,CategoryController.DeleteCategory);
routers.put("/soft-delete-category/:id",checkUserAuth,CategoryController.SoftDelete);
routers.get(  "/get-soft-deleted-category",checkUserAuth,CategoryController.GetSoftDeleteCategory);
routers.put("/restore-category/:id/",checkUserAuth,CategoryController.RestoreCategory);
routers.get("/parent-child-category",CategoryController.GetParentChild);

// Marketer/Manufacturer
routers.post("/add-marketer", checkUserAuth, MarketerController.AddMarketer);
routers.put("/update-marketer/:id",checkUserAuth,MarketerController.UpdateMarketer);
routers.post("/delete-marketer/:id",checkUserAuth,MarketerController.DeleteMarketer);
routers.get("/get-marketer", MarketerController.GetMarketer);
routers.get("/get-marketer/:id", MarketerController.GetMarketerId);
routers.put("/soft-delete-marketer/:id",checkUserAuth,MarketerController.SoftDeleteMarketer);
routers.get("/get-soft-delete-marketer",checkUserAuth,MarketerController.GetSoftDeleted);
routers.put("/restore-soft-delete-marketer/:id",checkUserAuth,MarketerController.RestoreSoftDeleteMarketer);

// Review
routers.get("/get-review", ReviewController.GetReviews);
routers.get("/get-review/:id", ReviewController.GetReviewsID);
routers.post("/add-review", checkUserAuth, ReviewController.AddReview);
routers.put("/update-review/:id", checkUserAuth, ReviewController.UpdateReview);
routers.delete("/delete-review/:id",checkUserAuth,ReviewController.DeleteReview);
routers.get("/get-trash-review", checkUserAuth, ReviewController.GetSoftDelete);
routers.put("/add-trash-review/:id", checkUserAuth, ReviewController.SoftDelete);
routers.put("/restore-trash-review/:id", checkUserAuth, ReviewController.RestoreReview);

//coupon
routers.post("/add-coupon",checkUserAuth,CouponsController.AddCoupons);
routers.get("/get-coupon",CouponsController.GetCoupon);
routers.get("/get-coupon/:id",CouponsController.GetCouponID);
routers.put("/update-coupon/:id",checkUserAuth,CouponsController.UpdateCoupon);
routers.delete("/delete-coupon/:id",checkUserAuth,CouponsController.DeleteCoupon);
routers.put("/soft-delete-coupon/:id",checkUserAuth,CouponsController.SoftDelete);
routers.get("/get-soft-delete-coupon",checkUserAuth,CouponsController.GetSoftDelete);
routers.put("/restore-soft-delete-coupon/:id",checkUserAuth,CouponsController.RestoreSoftDelete);

// general product
routers.post("/add-product",multipleProductUploads,checkUserAuth,ProductController.AddProduct);
routers.get("/get-product",ProductController.GetProduct);
routers.get("/get-product/:id",ProductController.GetProductID);
routers.delete("/delete-product/:id",checkUserAuth,ProductController.DeleteProduct);
routers.put("/update-product/:id",multipleProductUploads,checkUserAuth,ProductController.UpdateProduct);
routers.put("/add-product-trash/:id",checkUserAuth,ProductController.SoftDelete);
routers.get("/get-product-trash",checkUserAuth,ProductController.GetTrash);
routers.put("/restore-product-trash/:id",checkUserAuth,ProductController.RestoreTrash);

//brand
routers.post("/add-brand",multipleBrandUploads,checkUserAuth,BrandController.AddBrand)
routers.put("/update-brand/:id",multipleBrandUploads,checkUserAuth,BrandController.UpdateBrand)
routers.delete("/delete-brand/:id",checkUserAuth,BrandController.DeleteBrand)
routers.get("/get-brand",BrandController.GetBrand)
routers.get("/get-brand/:id",BrandController.GetBrandID)
routers.put("/soft-delete-brand/:id",checkUserAuth,BrandController.SoftDelete)
routers.get("/get-soft-delete-brand",checkUserAuth,BrandController.getSoftDelete)
routers.put("/restore-soft-delete-brand/:id",checkUserAuth,BrandController.RestoreTrash)




routers.get("/", (req, res)=> {
   res.send("heele");
})


export default routers;
