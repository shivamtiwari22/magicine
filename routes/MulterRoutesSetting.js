import fileUpload from "../config/fileupload.js";

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
  { name: "featured_image", maxCount: 1 },
  { name: "banner_img_center_one", maxCount: 1 },
  { name: "banner_img_center_two", maxCount: 1 },
  { name: "banner_img_center_three", maxCount: 1 },
  { name: "banner_img_center_four", maxCount: 1 },
  { name: "banner_img_center_five", maxCount: 1 },
]);
//multer category
const Categoryupdate = fileUpload("public/category/images");
const multipleCategoryUploads = Categoryupdate.fields([
  { name: "thumbnail_image", maxCount: 1 },
  { name: "banner_img_center_one", maxCount: 1 },
  { name: "banner_img_center_two", maxCount: 1 },
  { name: "banner_img_center_three", maxCount: 1 },
  { name: "banner_img_center_four", maxCount: 1 },
  { name: "banner_image_left_one", maxCount: 1 },
  { name: "banner_image_left_two", maxCount: 1 },
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
  { name: "banner_image_one" },
  { name: "banner_image_two" },
  { name: "banner_image_three" },
  { name: "banner_image_four" },
  { name: "banner_image_five" },
  { name: "banner_image_six" },
  { name: "banner_image_seven" },
  { name: "banner_image_eight" },
  { name: "image_one" },
  { name: "image_two" },
  { name: "image_three" },
  { name: "image_four" },
  { name: "left_banner" },
  { name: "right_banner" },

]);
const globalUpdate = fileUpload("public/global/images");
const globalUpload = globalUpdate.fields([
  { name: "logo", maxCount: 1 },
  { name: "icon_image", maxCount: 1 },

]);

export {
  multipleBrandUploads,
  multipleCategoryUploads,
  multipleProductUploads,
  multipleMedicineUploads,
  multipleSalesBannerUploads,
  multipleTestimonialUploads,
  globalUpload,
  profilePicUpload,
  multipleShippingPolicyUploads,
  multipleCustomerPolicyUploads,
  multipleReturnPolicyUploads,
  multipleTermConditionPolicyUploads,
  multiplePrivacyPolicyUploads,
  multipleHomePageUploads,
};
