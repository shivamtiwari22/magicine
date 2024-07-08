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
import ShippingPolicyController from "../controllers/admin/ShippingPolicyController.js";
import CountryStatePicker from 'country-state-picker';
import uploadProduct from "../middlewares/multer/ImageProduct.js";
import UserController from "../controllers/admin/UserController.js";
import MedicineController from "../controllers/admin/MedicineController.js";
import SalesBannerController from "../controllers/admin/SalesBanner.js";
import TestimonialController from "../controllers/admin/TestimonialsController.js";
import CustomFields from "../controllers/admin/CustomFieldController.js";
import PushNotification from "../controllers/admin/PushNotificationController.js";
import Notification from "../controllers/admin/NotificationController.js";
import CustomerPolicyController from "../controllers/admin/CustomerSupportController.js";
import RefundReturnController from "../controllers/admin/RefundReturnController.js";
import TermConditionController from "../controllers/admin/TermConditionController.js";
import PrivacyPolicyController from "../controllers/admin/privacyPolicyController.js";
import GlobalSetting from "../controllers/admin/GlobalSettingController.js";
import HomePageController from "../controllers/admin/HomePageController.js";
import SergicalEquipmentController from "../controllers/admin/SergicalEquipmentController.js";
import BlogCategoryController from "../controllers/admin/BlogCategoryController.js";
import BlogController from "../controllers/admin/BlogController.js";
import ShippingController from "../controllers/admin/ShippingController.js";
import BlogTagsController from "../controllers/admin/BlogtagController.js";
import InvertoryWithoutVarientController from "../controllers/admin/InventoryWithoutVarientController.js";
import InventoryWithVarientController from "../controllers/admin/InventoryWithVarientController.js";
import CarrierController from "../controllers/admin/CarrierController.js";
import fileUpload from "../config/fileupload.js";


import { multipleBrandUploads, multipleCategoryUploads, multipleMedicineUploads, multipleProductUploads, multipleSalesBannerUploads, multipleTestimonialUploads, multipleShippingPolicyUploads, multipleCustomerPolicyUploads, multipleReturnPolicyUploads, multipleTermConditionPolicyUploads, multiplePrivacyPolicyUploads, multipleHomePageUploads, multipleSergicalEquipentUpload, multipleglobalUpload, multipleBlogUpload, carrierUpload, withVarientUpload, productCSVUpload, medicineCSVUpload, inventoryWithoutVariantCSVUpload, reviewImageUpload, surgicalCSVUpload, contactUsUpload, aboutUsUpload, careerUpload, mediaupload } from "./MulterRoutesSetting.js";
import ContactUsController from "../controllers/admin/ContactUsController.js";
import AboutUsController from "../controllers/admin/AboutUsController.js";
import CareerController from "../controllers/admin/CareerController.js";
import JobPositionController from "../controllers/admin/JobPostionController.js";
import CartController from "../controllers/admin/CartController.js";
import OrderController from "../controllers/admin/OrderController.js";
import MediaController from "../controllers/admin/MediaController.js";



const routers = express.Router();

// Protected Routes
routers.use("/get-user", checkUserAuth);
routers.use("/change-password", checkUserAuth);

// image uploading path 
routers.use('/uploads', express.static('public/admin/images'));
routers.use('/file', express.static('public/user/images'));


// Open routes
routers.post("/register", AuthController.userRegistration);
routers.post("/login", AuthController.adminLogin);
routers.get("/get-user", AuthController.getLoginUser);
routers.post("/change-password", AuthController.changePassword);
routers.post("/send-reset-email", AuthController.resetMail);
routers.post("/reset-password/:id/:token", AuthController.resetPassword);
routers.post("/update-profile", uploadProduct('public/admin/images').single("profile_pic"), checkUserAuth, AuthController.updateProfile);

// global settings 
routers.post("/update-global-setting", multipleglobalUpload, checkUserAuth, GlobalSetting.addOrUpdateGlobal);
routers.get("/get-global", checkUserAuth, GlobalSetting.getGlobalSetting);


// user 
routers.post("/add-user", uploadProduct('public/user/images').single("profile_pic"), checkUserAuth, UserController.addUser);
routers.get("/get-all-users", checkUserAuth, UserController.getAllUsers);
routers.get("/user-by-id/:id", checkUserAuth, UserController.getUSerById);
routers.post("/update-user/:id", uploadProduct('public/user/images').single("profile_pic"), checkUserAuth, UserController.updateUserProfile);

// Custom Fields 
routers.post("/add-custom-field", checkUserAuth, CustomFields.addCustom);
routers.get("/get-all-fields", checkUserAuth, CustomFields.getAllFields);
routers.get("/get-field-id/:id", checkUserAuth, CustomFields.getFieldById);
routers.put("/update-custom-field/:id", checkUserAuth, CustomFields.updateCustomField);
routers.get("/get-soft-delete-field", checkUserAuth, CustomFields.getSoftDeleteField);
routers.get("/restore-field/:id", checkUserAuth, CustomFields.restoreField);
routers.get("/soft-delete-field/:id", checkUserAuth, CustomFields.SoftDelete);
routers.get("/delete-field/:id", checkUserAuth, CustomFields.deleteField);

// custom values 

routers.post("/add-custom-value", checkUserAuth, CustomFields.addCustomValue);
routers.get("/get-all-values/:id", checkUserAuth, CustomFields.getAllValues);
routers.get("/get-value-id/:id", checkUserAuth, CustomFields.getValueById);
routers.put("/update-value/:id", checkUserAuth, CustomFields.updateValue);
routers.get("/get-soft-delete-value/:id", checkUserAuth, CustomFields.getSoftDeleteValue);
routers.get("/restore-value/:id", checkUserAuth, CustomFields.restoreValue);
routers.get("/soft-delete-value/:id", checkUserAuth, CustomFields.SoftDeleteValue);
routers.get("/delete-field-value/:id", checkUserAuth, CustomFields.deleteFieldValue);

// push Notification
routers.post("/add-push", checkUserAuth, PushNotification.addPush)
routers.get("/all-push-notification", checkUserAuth, PushNotification.getAllPush)
routers.get("/get-push-id/:id", checkUserAuth, PushNotification.getSinglePush);
routers.put("/update-push/:id", checkUserAuth, PushNotification.updatePush);
routers.get("/all-soft-push", checkUserAuth, PushNotification.softDeletePush);
routers.get("/soft-delete-push/:id", checkUserAuth, PushNotification.SoftDeletePush);
routers.get("/restore-push/:id", checkUserAuth, PushNotification.restorePush);
routers.get("/delete-push/:id", checkUserAuth, PushNotification.deletePush);


// Notification 
routers.post("/add-notification", checkUserAuth, Notification.addNotification)
routers.get("/all-notification", checkUserAuth, Notification.getAllNotification)
routers.get("/get-notification-id/:id", checkUserAuth, Notification.getSingleNotification);
routers.put("/update-notification/:id", checkUserAuth, Notification.updateNotification);
routers.get("/all-soft-notification", checkUserAuth, Notification.allSoftDeleteNotification);
routers.get("/soft-delete-notification/:id", checkUserAuth, Notification.SoftDeleteNotification);
routers.get("/restore-notification/:id", checkUserAuth, Notification.restoreNotification);
routers.get("/delete-notification/:id", checkUserAuth, Notification.deleteNotification);

// tags
routers.post("/add-tags", checkUserAuth, TagController.AddTag);
routers.get("/get-tags", TagController.GetTags);
routers.put("/update-tags/:id", checkUserAuth, TagController.updateTag);
routers.delete("/delete-tags/:id", checkUserAuth, TagController.deleteTag);

// category
routers.post("/add-category", multipleCategoryUploads, checkUserAuth, CategoryController.AddCategory);
routers.get("/get-category", CategoryController.GetCategories);
routers.get("/get-category/:id", CategoryController.GetCategoryById);
routers.put("/update-category/:id", multipleCategoryUploads, checkUserAuth, CategoryController.UpdateCategory);
routers.delete("/delete-category/:id", checkUserAuth, CategoryController.DeleteCategory);
routers.put("/soft-delete-category/:id", checkUserAuth, CategoryController.SoftDelete);
routers.get("/get-soft-deleted-category", checkUserAuth, CategoryController.GetSoftDeleteCategory);
routers.put("/restore-category/:id/", checkUserAuth, CategoryController.RestoreCategory);
routers.get("/parent-child-category", CategoryController.GetParentChild);

// Marketer/Manufacturer
routers.post("/add-marketer", checkUserAuth, MarketerController.AddMarketer);
routers.put("/update-marketer/:id", checkUserAuth, MarketerController.UpdateMarketer);
routers.delete("/delete-marketer/:id", checkUserAuth, MarketerController.DeleteMarketer);
routers.get("/get-marketer", MarketerController.GetMarketer);
routers.get("/get-marketer/:id", MarketerController.GetMarketerId);
routers.put("/soft-delete-marketer/:id", checkUserAuth, MarketerController.SoftDeleteMarketer);
routers.get("/get-soft-delete-marketer", checkUserAuth, MarketerController.GetSoftDeleted);
routers.put("/restore-soft-delete-marketer/:id", checkUserAuth, MarketerController.RestoreSoftDeleteMarketer);

// Review
routers.get("/get-review/:modelType/:productId", ReviewController.GetReviews);
routers.get("/get-review-product", ReviewController.GetReviewsProduct);
routers.get("/get-review/:id", ReviewController.GetReviewsID);
routers.post("/add-review", reviewImageUpload, checkUserAuth, ReviewController.AddReview);
routers.put("/update-review/:id", reviewImageUpload, checkUserAuth, ReviewController.UpdateReview);
routers.put("/review-status-true/:id", checkUserAuth, ReviewController.ReviewStatusTrue);
routers.put("/review-status-false/:id", checkUserAuth, ReviewController.ReviewStatusFalse)

routers.get("/get-product-medicine-equipment", ReviewController.GetproductMedicineEquipment)

//coupon
routers.post("/add-coupon", checkUserAuth, CouponsController.AddCoupons);
routers.get("/get-coupon", CouponsController.GetCoupon);
routers.get("/get-coupon/:id", CouponsController.GetCouponID);
routers.put("/update-coupon/:id", checkUserAuth, CouponsController.UpdateCoupon);
routers.delete("/delete-coupon/:id", checkUserAuth, CouponsController.DeleteCoupon);
routers.put("/soft-delete-coupon/:id", checkUserAuth, CouponsController.SoftDelete);
routers.get("/get-soft-delete-coupon", checkUserAuth, CouponsController.GetSoftDelete);
routers.put("/restore-soft-delete-coupon/:id", checkUserAuth, CouponsController.RestoreSoftDelete);

// general product
routers.post("/add-product", multipleProductUploads, checkUserAuth, ProductController.AddProduct);
routers.get("/get-product", ProductController.GetProduct);
routers.get("/get-product/:id", ProductController.GetProductID);
routers.delete("/delete-product/:id", checkUserAuth, ProductController.DeleteProduct);
routers.put("/update-product/:id", multipleProductUploads, checkUserAuth, ProductController.UpdateProduct);
routers.put("/add-product-trash/:id", checkUserAuth, ProductController.SoftDelete);
routers.get("/get-product-trash", checkUserAuth, ProductController.GetTrash);
routers.put("/restore-product-trash/:id", checkUserAuth, ProductController.RestoreTrash);
routers.post("/import-product", checkUserAuth, productCSVUpload, ProductController.ImportProductCSV)
routers.get("/export-product", ProductController.ExportProductCSV)


//brand
routers.post("/add-brand", multipleBrandUploads, checkUserAuth, BrandController.AddBrand)
routers.put("/update-brand/:id", multipleBrandUploads, checkUserAuth, BrandController.UpdateBrand)
routers.delete("/delete-brand/:id", checkUserAuth, BrandController.DeleteBrand)
routers.get("/get-brand", BrandController.GetBrand)
routers.get("/get-brand/:id", BrandController.GetBrandID)
routers.put("/soft-delete-brand/:id", checkUserAuth, BrandController.SoftDelete)
routers.get("/get-soft-delete-brand", checkUserAuth, BrandController.getSoftDelete)
routers.put("/restore-soft-delete-brand/:id", checkUserAuth, BrandController.RestoreTrash)

//medicine
routers.post("/add-medicine", multipleMedicineUploads, checkUserAuth, MedicineController.AddMedicine)
routers.put("/update-medicine/:id", multipleMedicineUploads, checkUserAuth, MedicineController.UpdateMedicine)
routers.get("/get-medicine", MedicineController.GetMedicine)
routers.get("/get-medicine/:id", MedicineController.GetMedicineID)
routers.delete("/delete-medicine/:id", checkUserAuth, MedicineController.DeleteMedicine)
routers.put("/soft-delete-medicine/:id", checkUserAuth, MedicineController.SoftDeleteMedicine)
routers.get("/get-soft-delete-medicine", checkUserAuth, MedicineController.GetMedicineTrash)
routers.put("/restore-soft-delete-medicine/:id", checkUserAuth, MedicineController.RestoreMedicine)
routers.post("/import-medicine", medicineCSVUpload, checkUserAuth, MedicineController.ImportMedicineCSV)
routers.get("/export-medicine", MedicineController.ExportMedicineCSV)

//sales banner
routers.post("/add-sales-banner", multipleSalesBannerUploads, checkUserAuth, SalesBannerController.AddSalesBanner);
routers.put("/update-sales-banner/:id", multipleSalesBannerUploads, checkUserAuth, SalesBannerController.UpdateBanner)
routers.get("/get-sales-banner", SalesBannerController.GetSalesBanner)
routers.get("/get-sales-banner/:id", SalesBannerController.GetSalesBannerID)
routers.delete("/delete-sales-banner/:id", checkUserAuth, SalesBannerController.DeleteSalesBanner)
routers.put("/trash-sales-banner/:id", checkUserAuth, SalesBannerController.SoftDelete)
routers.put("/restore-sales-banner/:id", checkUserAuth, SalesBannerController.RestoreTrash)
routers.get("/get-sales-banner-trash", checkUserAuth, SalesBannerController.GetTrashSalesBanner)


//testimonial
routers.post("/add-testimonial", checkUserAuth, multipleTestimonialUploads, TestimonialController.AddTestimonial)
routers.put("/update-testimonial/:id", checkUserAuth, multipleTestimonialUploads, TestimonialController.UpdateTestimonial)
routers.get("/get-testimonial", TestimonialController.GetTestimonial)
routers.get("/get-testimonial/:id", TestimonialController.GetTestimonialID)
routers.put("/soft-delete-testimonial/:id", checkUserAuth, TestimonialController.SoftDelete)
routers.put("/restore-testimonial/:id", checkUserAuth, TestimonialController.RestoreTestimonial)
routers.get("/get-trash-testimonial", checkUserAuth, TestimonialController.GetTrashTestimonial)
routers.delete("/delete-testimonial/:id", checkUserAuth, TestimonialController.DeleteTestimonial)


// shipping policy
routers.post("/add-shipping-policy", multipleShippingPolicyUploads, checkUserAuth, ShippingPolicyController.AddShippingPolicy)
routers.get("/get-shipping-policy", ShippingPolicyController.GetShippingPolicy)


// customer support policy
routers.post("/add-customer-support-policy", multipleCustomerPolicyUploads, checkUserAuth, CustomerPolicyController.AddCustomerPolicy)
routers.get("/get-customer-support-policy", CustomerPolicyController.GetCustomerPolicy)


// refund return policy
routers.post("/add-refund-return-policy", multipleReturnPolicyUploads, checkUserAuth, RefundReturnController.AddRefundReturn)
routers.get("/get-refund-return-policy", RefundReturnController.GetRefundReturnPolicy)


// terms and condition policy
routers.post("/add-term-condition-policy", multipleTermConditionPolicyUploads, checkUserAuth, TermConditionController.AddTermCondition)
routers.get("/get-term-condition-policy", TermConditionController.GetTermConditionPolicy)


// privacy policy
routers.post("/add-privacy-policy", multiplePrivacyPolicyUploads, checkUserAuth, PrivacyPolicyController.AddPrivacyPolicy)
routers.get("/get-privacy-policy", PrivacyPolicyController.GetPrivacyPolicy)


//home page
routers.post("/add-home-page", multipleHomePageUploads, checkUserAuth, HomePageController.AddHomePagePolicy)
routers.get("/get-home-page", HomePageController.GetHomePage)


//sergical equipment
routers.post("/add-sergical-equipment", multipleSergicalEquipentUpload, checkUserAuth, SergicalEquipmentController.AddSergicalEquipment)
routers.get("/get-sergical-equipment", SergicalEquipmentController.GetSergicalEquipment)
routers.get("/get-sergical-equipment/:id", SergicalEquipmentController.GetSergicalEquipmentID)
routers.put("/update-sergical-equipment/:id", multipleSergicalEquipentUpload, checkUserAuth, SergicalEquipmentController.UpdateSurgicalEquipment)
routers.delete("/delete-sergical-equipment/:id", multipleBrandUploads, checkUserAuth, SergicalEquipmentController.DeleteEquipment)
routers.put("/soft-delete-sergical-equipment/:id", checkUserAuth, SergicalEquipmentController.SoftDelete)
routers.put("/restore-sergical-equipment/:id", checkUserAuth, SergicalEquipmentController.RestoreEquipment)
routers.get("/get-trash-sergical-equipment", SergicalEquipmentController.GetTrash)
routers.get('/export-sergical', SergicalEquipmentController.sergicalCsv);
routers.post("/import-sergical", checkUserAuth, surgicalCSVUpload, SergicalEquipmentController.ImportSergicalCSV)


//blog category
routers.post("/add-blog-category", checkUserAuth, BlogCategoryController.AddBlogCategory)
routers.put("/update-blog-category/:id", checkUserAuth, BlogCategoryController.UpdateBlogCategory)
routers.get("/get-blog-category", BlogCategoryController.GetBlogCategory)
routers.get("/get-blog-category/:id", BlogCategoryController.GetBlogCategoryID)
routers.delete("/delete-blog-category/:id", checkUserAuth, BlogCategoryController.DeleteBlogCategory)
routers.put("/add-trash-blog-category/:id", checkUserAuth, BlogCategoryController.SoftDelete)
routers.put("/restore-trash-blog-category/:id", checkUserAuth, BlogCategoryController.Restore)
routers.get("/get-trash-blog-category", BlogCategoryController.GetTrash)
routers.get("/parent-child-blogh-category", BlogCategoryController.GetParentChild)


//blog
routers.post("/add-blog", multipleBlogUpload, checkUserAuth, BlogController.AddBlog)
routers.get("/get-blog", BlogController.GetBlog)
routers.get("/get-blog/:id", BlogController.GetBlogID)
routers.put("/update-blog/:id", multipleBlogUpload, checkUserAuth, BlogController.UpdateBlog)
routers.put("/add-trash-blog/:id", checkUserAuth, BlogController.SoftDelete)
routers.put("/restore-trash-blog/:id", checkUserAuth, BlogController.Restore)
routers.get("/get-trash-blog", BlogController.GetTrash)
routers.delete("/delete-blog/:id", checkUserAuth, BlogController.DeleteBlog)

// blog tags
routers.post("/add-blog-tag", checkUserAuth, BlogTagsController.AddBlogTags)
routers.put("/update-blog-tag/:id", checkUserAuth, BlogTagsController.UpdateBlogTags)
routers.get("/get-blog-tag", BlogTagsController.GetBlogtags)
routers.get("/get-blog-tag/:id", BlogTagsController.GetBlogsTagsID)
routers.delete("/delete-blog-tag/:id", checkUserAuth, BlogTagsController.DeleteBlogTags)

//inventory items search
routers.get("/get-product-medicine", checkUserAuth, InvertoryWithoutVarientController.SearchProductsAndMedicine)

//inventory without varient
routers.post("/add-inventory-without-varient", checkUserAuth, InvertoryWithoutVarientController.AddInventoryWithoutVarient)
routers.get("/get-inventory-without-varient", InvertoryWithoutVarientController.GetInventoryWithoutVarient)
routers.get("/get-inventory-without-varient/:id", InvertoryWithoutVarientController.GetInventoryWithoutVarientID)
routers.put("/update-inventory-without-varient/:id", checkUserAuth, InvertoryWithoutVarientController.UpdateInventoryWithoutVarient)
routers.put("/add-trash-inventory-without-varient/:id", checkUserAuth, InvertoryWithoutVarientController.SoftDeleteInventoryWithoutVarient)
routers.put("/restore-inventory-without-varient/:id", checkUserAuth, InvertoryWithoutVarientController.RestoreInventoryWithoutVarient)
routers.get("/get-trash-inventory-without-varient", checkUserAuth, InvertoryWithoutVarientController.GetTrashInventoryWithoutVarient)
routers.delete("/delete-inventory-without-varient/:id", checkUserAuth, InvertoryWithoutVarientController.DeleteInventoryWithoutVarient)
routers.post("/import-inventory-without-variant", inventoryWithoutVariantCSVUpload, checkUserAuth, InvertoryWithoutVarientController.ImportInventory)
routers.get("/export-inventory-without-variant", InvertoryWithoutVarientController.ExportInventory)

// shipping Zones 
routers.post("/add-zone", checkUserAuth, ShippingController.AddZone)
routers.get("/get-zones", checkUserAuth, ShippingController.GetZones)
routers.delete("/delete-zone/:id", checkUserAuth, ShippingController.deleteZoneById)
routers.put("/update-zone/:id", checkUserAuth, ShippingController.updateZoneById)
routers.delete("/delete-shipping-country/:id", checkUserAuth, ShippingController.deleteZoneCountryById)
routers.put("/update-country/:id", checkUserAuth, ShippingController.updateCountryById)
routers.get("/get-country-list", ShippingController.GetCountryList)

// shipping Rates 
routers.post("/add-rate", checkUserAuth, ShippingController.AddRate)
routers.delete("/delete-rate/:id", checkUserAuth, ShippingController.deleteRateById)
routers.put("/update-rate/:id", checkUserAuth, ShippingController.updateRateById)

// Customer Data apis 
routers.post("/add-contact", CustomerPolicyController.addContact)
routers.get("/all-contacts", checkUserAuth, CustomerPolicyController.AllContacts)
routers.get('/export-contacts', CustomerPolicyController.contactCsv);

// Subscribers 
routers.post("/post-subscribers", CustomerPolicyController.PostSubscribers)
routers.get("/all-subscriber", checkUserAuth, CustomerPolicyController.AllSubscribers)
routers.delete("/delete-subscriber/:id", checkUserAuth, CustomerPolicyController.deleteSubscriberById)
routers.put("/update-subscriber-status/:id", checkUserAuth, CustomerPolicyController.updateSubscriberById)
routers.get('/export-subscribers', CustomerPolicyController.subscribersCsv);

//  Product Enquiry 
routers.post("/post-product-enquiry", checkUserAuth, CustomerPolicyController.addProductEnquiry)
routers.get("/all-product-enquiry", checkUserAuth, CustomerPolicyController.getAllProductQuery)
routers.get('/export-product-query', CustomerPolicyController.productQueryCsv);

// Prescription Request 
routers.post("/post-prescription", checkUserAuth, CustomerPolicyController.postPrescription)
routers.get("/all-prescription", checkUserAuth, CustomerPolicyController.getAllPrescription)
routers.get('/export-prescription', CustomerPolicyController.prescriptionCsv);


// customer cart 
routers.get('/all-cart', checkUserAuth, CartController.AllCart);
routers.get('/export-cart', CartController.exportCart);

// customer order 
routers.get("/all-order", checkUserAuth, OrderController.AllOrder);
routers.get("/order-detail/:id", checkUserAuth, OrderController.OrderDetails);
routers.get("/update-status", checkUserAuth, OrderController.UpdateOrderStatus);
routers.get("/download-order-csv", OrderController.OrderCsv);

// cancellation request 
routers.get("/all-cancellation", checkUserAuth, OrderController.CancelRequest);




//inventory with varient
routers.get("/get-inventory-attributes/:modelType/:modelId", InventoryWithVarientController.GetCustomFields);
routers.post("/add-inventory-varients", withVarientUpload, checkUserAuth, InventoryWithVarientController.AddInventory)
routers.get("/get-inventory-varients", InventoryWithVarientController.GetVariantProduct)
routers.get("/get-varients/:modelType/:modelId", InventoryWithVarientController.GetVarientsOnly)
routers.put("/update-varients/:modelType/:modelId", checkUserAuth, withVarientUpload, InventoryWithVarientController.UpdateInventoryWithVariants)
routers.get("/get-trash-variant", checkUserAuth, InventoryWithVarientController.GetTrashInventoryWithVariant)
routers.put("/add-trash-variant/:modelType/:modelId", checkUserAuth, InventoryWithVarientController.AddToTrash)
routers.put("/restore-trash-variant/:modelType/:modelId", checkUserAuth, InventoryWithVarientController.RestoreFromTrash)
routers.delete("/delete-trash-variant/:modelType/:modelId", checkUserAuth, InventoryWithVarientController.DeleteInventoryWithVariant)




//carrier
routers.post("/add-carrier", carrierUpload, checkUserAuth, CarrierController.AddCarrier)
routers.get("/get-carrier", CarrierController.GetCarrier)
routers.get("/get-carrier/:id", CarrierController.GetCarrierID)
routers.put("/update-carrier/:id", checkUserAuth, carrierUpload, CarrierController.UpdateCarrier)
routers.put("/add-trash-carrier/:id", checkUserAuth, CarrierController.SoftDelete)
routers.put("/restore-carrier/:id", checkUserAuth, CarrierController.Restore)
routers.get("/get-carrier-trash", checkUserAuth, CarrierController.GetTrash)
routers.delete("/delete-carrier-trash/:id", checkUserAuth, CarrierController.DeleteTrash)



//contact us
routers.post("/add-update-contact-us", checkUserAuth, contactUsUpload, ContactUsController.AddContactUs)
routers.get("/get-contact-us", ContactUsController.getContactUs)



//about us
routers.post("/add-update-about-us", checkUserAuth, aboutUsUpload, AboutUsController.AddAboutUs)
routers.get("/get-about-us", AboutUsController.GetAboutUs)

// career
routers.post("/add-update-career", checkUserAuth, careerUpload, CareerController.AddUpdateCareer)
routers.get("/get-career", CareerController.getCareer)

// Applications 
routers.post("/post-application", uploadProduct('public/user/resume').single("resume"), JobPositionController.postApplication)
routers.get("/all-application", JobPositionController.allApplications)
routers.delete("/delete-application/:id", checkUserAuth, JobPositionController.deleteApp)
routers.get("/export-app-csv", JobPositionController.appCsv)

// Positions 
routers.post("/add-position", checkUserAuth, JobPositionController.addPosition)
routers.get("/all-position", JobPositionController.allPosition)
routers.delete("/delete-position/:id", JobPositionController.deletePosition)
routers.put("/update-position/:id", checkUserAuth, JobPositionController.updatePosition)
routers.get("/position-by-id/:id", JobPositionController.positionById)
routers.get("/update-position-status/:id", checkUserAuth, JobPositionController.updatePositionStatus)

// media 
routers.post("/add-media", checkUserAuth, mediaupload, MediaController.AddMedia)
routers.get("/get-all-media", checkUserAuth, MediaController.GetAllMedia)
routers.get("/get-media/:id", checkUserAuth, MediaController.GetSingleMedia)
// routers.put("/update-media/:id", checkUserAuth, mediaupload, MediaController.UpdateMedia)
// routers.put("/add-media-trash/:id", checkUserAuth, MediaController.AddTrash)
// routers.put("/restore-media/:id", checkUserAuth, MediaController.RestoreTrash)
// routers.get("/get-trash-media", checkUserAuth, MediaController.GetTrashMedia)
routers.delete("/delete-media/:id", checkUserAuth, MediaController.DeleteMedia)


routers.get("/get-country", async (req, res) => {
   const all = await Country.find();
   res.send(all);
})

routers.get('/export-users', UserController.csv);


routers.get("/", (req, res) => {
   res.send("Working");
})





export default routers;
