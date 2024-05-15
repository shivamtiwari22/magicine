import fileUpload from "../config/fileupload.js";

//multer product
const Productupdate=fileUpload('public/product/images')
const multipleProductUploads = Productupdate.fields([
    { name: "featured_image" },
    { name: "gallery_image"}
  ]);

//multer brand
const Brandupdate=fileUpload('public/brand/images')
const multipleBrandUploads = Brandupdate.fields([
    { name: "banner_img_center_one" ,maxCount:1},
    { name: "banner_img_center_two" ,maxCount:1},
    { name: "banner_img_center_three" ,maxCount:1},
    { name: "banner_img_left_one" ,maxCount:1},
    { name: "banner_img_left_two" ,maxCount:1},
    
  ]);
//multer category
const Categoryupdate=fileUpload('public/category/images')
const multipleCategoryUploads = Categoryupdate.fields([
    { name: "thumbnail_image" ,maxCount:1},
    { name: "banner_img_center_one" ,maxCount:1},
    { name: "banner_img_center_two" ,maxCount:1},
    { name: "banner_img_center_three" ,maxCount:1},
    { name: "banner_img_center_four" ,maxCount:1},
    { name: "banner_img_left_one" ,maxCount:1},
    { name: "banner_img_left_two" ,maxCount:1},
    ]);


    export {multipleBrandUploads,multipleCategoryUploads,multipleProductUploads}