import Brand from "../../src/models/adminModel/BrandModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

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
        featured_image,
        banner_img_center_one,
        banner_img_center_two,
        banner_img_center_three,
        banner_img_center_four,
        banner_img_center_five,
        top_deals,
        ...brandData
      } = req.body;

      const parseJsonField = (field) => {
        try {
          return Array.isArray(field) ? field.map(JSON.parse) : JSON.parse(field);
        } catch (error) {
          console.error("Failed to parse JSON field:", error);
          return field;
        }
      };
      const parsedTopDeals = parseJsonField(top_deals);


      const existingBrand = await Brand.findOne({
        brand_name: brandData.brand_name,
      });

      if (existingBrand) {
        return handleResponse(409, "This brand already exists.", {}, resp);
      }

      const newBrand = new Brand({
        created_by: user.id,
        top_deals: parsedTopDeals,
        ...brandData,
      });

      const base_url = `${req.protocol}://${req.get("host")}`;

      if (images) {
        if (images && images.featured_image) {
          newBrand.featured_image = `${base_url}/${images.featured_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_img_center_one) {
          newBrand.banner_img_center_one = `${base_url}/${images.banner_img_center_one[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_img_center_two) {
          newBrand.banner_img_center_two = `${base_url}/${images.banner_img_center_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_img_center_three) {
          newBrand.banner_img_center_three = `${base_url}/${images.banner_img_center_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_img_center_four) {
          newBrand.banner_img_center_four = `${base_url}/${images.banner_img_center_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images && images.banner_img_center_five) {
          newBrand.banner_img_center_five = `${base_url}/${images.banner_img_center_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
      }

      await newBrand.save();

      return handleResponse(
        201,
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

      const { top_deals, ...brandData } = req.body;


      const parseJsonField = (field) => {
        try {
          return Array.isArray(field) ? field.map(JSON.parse) : JSON.parse(field);
        } catch (error) {
          console.error("Failed to parse JSON field:", error);
          return field;
        }
      };


      const parsedTopDeals = parseJsonField(top_deals);

      const brand = await Brand.findOne({ id });

      if (!brand) {
        return handleResponse(404, "Brand not found", {}, resp);
      }

      const existingBrand = await Brand.findOne({
        brand_name: brandData.brand_name,
        id: { $ne: id },
      });
      if (existingBrand) {
        return handleResponse(
          409,
          "Brand with this name already exists",
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

      const base_url = `${req.protocol}://${req.get("host")}`;

      if (images) {
        if (images.featured_image) {
          duplicateBrand.featured_image = `${base_url}/${images.featured_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_one) {
          duplicateBrand.banner_img_center_one = `${base_url}/${images.banner_img_center_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_two) {
          duplicateBrand.banner_img_center_two = `${base_url}/${images.banner_img_center_two[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_three) {
          duplicateBrand.banner_img_center_three = `${base_url}/${images.banner_img_center_three[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_four) {
          duplicateBrand.banner_img_center_four = `${base_url}/${images.banner_img_center_four[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        if (images.banner_img_center_five) {
          duplicateBrand.banner_img_center_five = `${base_url}/${images.banner_img_center_five[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
      }

      duplicateBrand.top_deals = parsedTopDeals

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
        return handleResponse(200, "Brand Deleted Successfully", {}, resp);
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
        return handleResponse(200, "No Brand available.", {}, resp);
      }

      for (const loop of allBrand) {
        const CreatedBy = await User.findOne({ id: loop.created_by });
        loop.created_by = CreatedBy;
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
        return handleResponse(200, "No Brand found.", {}, resp);
      }

      if (brand.created_by) {
        const CreatedBy = await User.findOne({ id: brand.created_by });
        brand.created_by = CreatedBy;
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
          "Brand Successfully Added To Trash",
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
        return handleResponse(200, "No Brand found in trash.", {}, resp);
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
          "Brand Restored successfully",
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
