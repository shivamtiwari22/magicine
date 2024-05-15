import Brand from "../../src/models/adminModel/BrandModel.js";
import handleResponse from "../../config/http-response.js";

class BrandController {
  // Add brand
  static AddBrand = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const images = req.files;

      const {
        banner_img_center_one,
        banner_img_center_two,
        banner_img_center_three,
        banner_img_left_one,
        banner_img_left_two,
        ...brandData
      } = req.body;

      const existingBrand = await Brand.findOne({
        brand_name: brandData.brand_name,
      });

      if (existingBrand) {
        return handleResponse(409, "This brand already exists.", {}, resp);
      }

      const newBrand = new Brand({
        banner_img_center_one: images?.banner_img_center_one
          ? images.banner_img_center_one[0].path
          : null,
        banner_img_center_two: images?.banner_img_center_two
          ? images.banner_img_center_two[0].path
          : null,
        banner_img_center_three: images?.banner_img_center_three
          ? images.banner_img_center_three[0].path
          : null,
        banner_img_left_one: images?.banner_img_left_one
          ? images.banner_img_left_one[0].path
          : null,
        banner_img_left_two: images?.banner_img_left_two
          ? images.banner_img_left_two[0].path
          : null,
        created_by: user.id,
        ...brandData,
      });

      await newBrand.save();

      return handleResponse(
        200,
        "Brand added successfully",
        { newBrand },
        resp
      );
    } catch (err) {
      if (err.name === "ValidationError") {
        const validationErrors = Object.keys(err.errors).map((field) => ({
          field: field,
          message: err.errors[field].message,
        }));
        return handleResponse(
          400,
          "Validation error.",
          { errors: validationErrors },
          resp
        );
      } else {
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };

  // update brand
  static UpdateBrand = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const images = req.files;

      const {
        banner_img_center_one,
        banner_img_center_two,
        banner_img_center_three,
        banner_img_left_one,
        banner_img_left_two,
        ...brandData
      } = req.body;

      const brand = await Brand.findOne({ id });

      if (!brand) {
        return handleResponse(404, "Brand not found", {}, resp);
      }

      const existingBrand = await Brand.findOne({
        brand_name: brandData.brand_name,
      });
      if (existingBrand) {
        return handleResponse(
          409,
          "Brand with this brand name already exists",
          {},
          resp
        );
      }

      const duplicateBrand = await Brand.findOne({ id });

      for (const key in brandData) {
        if (Object.hasOwnProperty.call(brandData, key)) {
          duplicateBrand[key] = brandData[key];
        }
      }

      if (
        images &&
        images.banner_img_center_one &&
        images.banner_img_center_one.length > 0
      ) {
        duplicateBrand.banner_img_center_one =
          images.banner_img_center_one[0].path;
      }
      if (
        images &&
        images.banner_img_center_two &&
        images.banner_img_center_two.length > 0
      ) {
        duplicateBrand.banner_img_center_two =
          images.banner_img_center_two[0].path;
      }
      if (
        images &&
        images.banner_img_center_three &&
        images.banner_img_center_three.length > 0
      ) {
        duplicateBrand.banner_img_center_three =
          images.banner_img_center_three[0].path;
      }
      if (
        images &&
        images.banner_img_left_one &&
        images.banner_img_left_one.length > 0
      ) {
        duplicateBrand.banner_img_left_one = images.banner_img_left_one[0].path;
      }
      if (
        images &&
        images.banner_img_left_two &&
        images.banner_img_left_two.length > 0
      ) {
        duplicateBrand.banner_img_left_two = images.banner_img_left_two[0].path;
      }

      await duplicateBrand.save();

      return handleResponse(
        200,
        "Brand updated successfully",
        { duplicateBrand },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //delete brand
  static DeleteBrand = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const brand = await Brand.findOne({ id: id });

      if (!brand) {
        return handleResponse(404, "Brand not found", {}, resp);
      }
      if (brand.deleted_at !== null) {
        await Brand.findOneAndDelete({ id: id });
        return handleResponse(200, "Brand deleted successfully", {}, resp);
      } else {
        return handleResponse(
          400,
          "For deleting this brand you have to add it to the trash.",
          {},
          resp
        );
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get brand
  static GetBrand = async (req, resp) => {
    try {
      const brand = await Brand.find().sort({ createdAt: -1 });
      const allBrand = await brand.filter((brand) => brand.deleted_at === null);
      if (allBrand.length <= 0) {
        return handleResponse(404, "No Brand available.", {}, resp);
      }

      return handleResponse(
        200,
        "Brand fetched successfully",
        { allBrand },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get id
  static GetBrandID = async (req, resp) => {
    try {
      const { id } = req.params;
      const brand = await Brand.findOne({ id }).sort({ createdAt: -1 });
      if (!brand) {
        return handleResponse(404, "No Brand found.", {}, resp);
      }
      return handleResponse(200, "Brand fetched successfully", { brand }, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //soft delete
  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const brand = await Brand.findOne({ id });
      if (!brand) {
        return handleResponse(404, "Brand not found", {}, resp);
      }
      if (brand.deleted_at === null) {
        brand.deleted_at = new Date();
        await brand.save();
        return handleResponse(
          200,
          "Brand deleted successfully",
          { brand },
          resp
        );
      } else {
        return handleResponse(400, "Brand already added to trash.", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get soft delete
  static getSoftDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const brand = await Brand.find();
      const allTrashBrand = await brand.filter(
        (brand) => brand.deleted_at !== null
      );
      if (allTrashBrand.length < 1) {
        return handleResponse(404, "No Brand found in trash.", {}, resp);
      }
      return handleResponse(
        200,
        "Brand Trash fetched successfully",
        { allTrashBrand },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // restore brand
  static RestoreTrash = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const brand = await Brand.findOne({ id });
      if (!brand) {
        return handleResponse(404, "Brand not found", {}, resp);
      }
      if (brand.deleted_at !== null) {
        brand.deleted_at = null;
        await brand.save();
        return handleResponse(
          200,
          "Brand deleted successfully",
          { brand },
          resp
        );
      } else {
        return handleResponse(400, "Brand already restored.", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default BrandController;
