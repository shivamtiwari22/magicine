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

export {
  multipleBrandUploads,
  multipleCategoryUploads,
  multipleProductUploads,
  multipleMedicineUploads,
  multipleSalesBannerUploads,
  multipleTestimonialUploads
};
