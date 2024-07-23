import fileUpload from "../config/fileupload.js";
import multer from "multer";
import path from "path";

//multer product
const Productupdate = fileUpload("public/product/images");
const multipleProductUploads = Productupdate.fields([
  { name: "featured_image" },
  { name: "gallery_image" },
]);
const Medicineupdate = fileUpload("public/medicine/images");
const multipleMedicineUploads = Medicineupdate.fields([
  { name: "featured_image" },
  { name: "gallery_image" },
]);

const ProfilePicUpdate = fileUpload("public/admin/images");
const profilePicUpload = ProfilePicUpdate.fields([{ name: "profile_pic" }]);

//multer brand
const Brandupdate = fileUpload("public/brand/images");
const multipleBrandUploads = Brandupdate.fields([
  { name: "featured_image" },
  { name: "banner_img_center_one" },
  { name: "banner_img_center_two" },
  { name: "banner_img_center_three" },
  { name: "banner_img_center_four" },
  { name: "banner_img_center_five" },
]);

//multer category
const Categoryupdate = fileUpload("public/category/images");
const multipleCategoryUploads = Categoryupdate.fields([
  { name: "thumbnail_image" },
  { name: "banner_img_center_one" },
  { name: "banner_img_center_two" },
  { name: "banner_img_center_three" },
  { name: "banner_img_center_four" },
  { name: "banner_image_left_one" },
  { name: "banner_image_left_two" },
]);

const SalesBannerUpdate = fileUpload("public/sales-banner/images");
const multipleSalesBannerUploads = SalesBannerUpdate.fields([
  { name: "banner_image" },
]);

const TestimonialUpdate = fileUpload("public/sales-banner/images");
const multipleTestimonialUploads = TestimonialUpdate.fields([
  { name: "image" },
]);

const ShippingPolicyUpdate = fileUpload("public/shipping-policy/images");
const multipleShippingPolicyUploads = ShippingPolicyUpdate.fields([
  { name: "banner_image" },
]);

const CustomerPolicyUpdate = fileUpload("public/customer-policy/images");
const multipleCustomerPolicyUploads = CustomerPolicyUpdate.fields([
  { name: "banner_image" },
]);

const ReturnPolicyUpdate = fileUpload("public/return-refund-policy/images");
const multipleReturnPolicyUploads = ReturnPolicyUpdate.fields([
  { name: "banner_image" },
]);

const TermConditionPolicyUpdate = fileUpload(
  "public/term-condition-policy/images"
);
const multipleTermConditionPolicyUploads = TermConditionPolicyUpdate.fields([
  { name: "banner_image" },
]);

const privacyPolicyUpdate = fileUpload("public/term-condition-policy/images");
const multiplePrivacyPolicyUploads = privacyPolicyUpdate.fields([
  { name: "banner_image" },
]);

const homePageUpdate = fileUpload("public/home-page/images");
const multipleHomePageUploads = homePageUpdate.fields([
  { name: "slider_image" },
  { name: "image_one" },
  { name: "image_two" },
  { name: "image_three" },
  { name: "image_four" },
  { name: "image_five" },
  { name: "image_six" },
  { name: "image_seven" },
  { name: "image_eight" },
  { name: "image_nine" },
  { name: "image_ten" },
  { name: "image_eleven" },
  { name: "image_twelve" },
  { name: "image_thirteen" },
  { name: "image_fourteen" },
]);

const sergicalEquipmentUpdate = fileUpload("public/sergical-equipment/images");
const multipleSergicalEquipentUpload = sergicalEquipmentUpdate.fields([
  { name: "featured_image" },
  { name: "gallery_image" },
]);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/global/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const multipleglobalUpload = upload.fields([
  { name: "logo" },
  { name: "icon_image" },
  { name: "instagram_logo" },
  { name: "facebook_logo" },
  { name: "x_logo" },
  { name: "youtube_logo" },
  { name: "linkdin_logo" },
  { name: "pinterest_logo" },
]);

const blogUpdate = fileUpload("public/blog/images");
const multipleBlogUpload = blogUpdate.fields([{ name: "banner_image" }]);

const carrierUpdate = fileUpload("public/carrier/images");
const carrierUpload = carrierUpdate.fields([{ name: "logo" }]);

const withVarientUpdate = fileUpload("public/inventory-varient/images");
const withVarientUpload = withVarientUpdate.any();

const contactUsUpdate = fileUpload("public/contactUs/images");
const contactUsUpload = contactUsUpdate.fields([{ name: "banner_image" }]);

const aboutUsUpdate = fileUpload("public/aboutUs/images");
const aboutUsUpload = aboutUsUpdate.fields([
  { name: "image_one" },
  { name: "image_two" },
  { name: "image_three" },
  { name: "image_four" },
  { name: "image_five" },
  { name: "image_six" },
  { name: "image_seven" },
  { name: "image_eight" },
  { name: "image_nine" },
  { name: "image_ten" },
  { name: "image_eleven" },
  { name: "image_twelve" },
  { name: "image_thirteen" },
  { name: "image_fourteen" },
  { name: "image_fifteen" },
  { name: "image_sixteen" },
  { name: "image_seventeen" },
  { name: "image_eighteen" },
]);
const careerUpdate = fileUpload("public/career/images");
const careerUpload = careerUpdate.fields([
  { name: "image_one" },
  { name: "image_two" },
  { name: "image_three" },
  { name: "image_four" },
  { name: "image_five" },
  { name: "image_six" },
  { name: "image_seven" },
  { name: "image_eight" },
  { name: "image_nine" },
  { name: "image_ten" },
]);

// -------------------------------------------------------import csv-------------------
const productCSVUpdate = fileUpload("public/product/csv");
const productCSVUpload = productCSVUpdate.fields([{ name: "csvFile" }]);

const medicineCSVUpdate = fileUpload("public/medicine/csv");
const medicineCSVUpload = medicineCSVUpdate.fields([{ name: "csvFile" }]);

const inventoryWithoutVariantCSVUpdate = fileUpload(
  "public/inventory-without-varient/csv"
);
const inventoryWithoutVariantCSVUpload =
  inventoryWithoutVariantCSVUpdate.fields([{ name: "csvFile" }]);

const reviewImageUpdate = fileUpload("public/review/images");
const reviewImageUpload = reviewImageUpdate.fields([{ name: "images" }]);

const surgicalCSVUpdate = fileUpload("public/sergical-equipment/csv");
const surgicalCSVUpload = surgicalCSVUpdate.fields([{ name: "csvFile" }]);

const mediaupdate = fileUpload("public/media/images");
const mediaupload = mediaupdate.fields([{ name: "image" }])

const jobPostingMedia = fileUpload("public/jobPosting/images");
const jobPostingUpload = jobPostingMedia.fields([{ name: "banner_image" }])

export {
  multipleBrandUploads,
  multipleCategoryUploads,
  multipleProductUploads,
  multipleMedicineUploads,
  multipleSalesBannerUploads,
  multipleTestimonialUploads,
  multipleglobalUpload,
  profilePicUpload,
  multipleShippingPolicyUploads,
  multipleCustomerPolicyUploads,
  multipleReturnPolicyUploads,
  multipleTermConditionPolicyUploads,
  multiplePrivacyPolicyUploads,
  multipleHomePageUploads,
  multipleSergicalEquipentUpload,
  multipleBlogUpload,
  carrierUpload,
  withVarientUpload,
  contactUsUpload,
  aboutUsUpload,
  careerUpload,
  mediaupload,
  jobPostingUpload,
  // -------------import-csv-------------
  productCSVUpload,
  medicineCSVUpload,
  inventoryWithoutVariantCSVUpload,
  reviewImageUpload,
  surgicalCSVUpload,
};
