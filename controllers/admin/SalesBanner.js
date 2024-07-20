import SalesBanner from "../../src/models/adminModel/SalesBanner.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class SalesBannerController {
  //add sales banner
  static AddSalesBanner = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { banner_image, ...bannerData } = req.body;
      const images = req.files;

      const newBanner = new SalesBanner({
        ...bannerData,
        created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}`;
      if (images && images.banner_image) {
        newBanner.banner_image = `${base_url}/${images.banner_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }

      await newBanner.save();
      return handleResponse(
        201,
        "Sales banner added successfully",
        { newBanner },
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

  //update banner
  static UpdateBanner = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;

      const { banner_image, ...bannerData } = req.body;

      const images = req.files;

      const banner = await SalesBanner.findOne({ id: id });

      if (!banner) {
        return handleResponse(404, "Banner not found", {}, resp);
      }

      for (const key in bannerData) {
        if (bannerData.hasOwnProperty(key)) {
          banner[key] = bannerData[key];
        }
      }

      const base_url = `${req.protocol}://${req.get("host")}`;
      if (images && images.banner_image) {
        banner.banner_image = `${base_url}/${images.banner_image[0].path.replace(
          /\\/g,
          "/"
        )}`;
      }
      await banner.save();
      return handleResponse(
        200,
        "Banner updated successfully",
        banner,
        resp
      );

    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get sales banner
  static GetSalesBanner = async (req, resp) => {
    try {
      const banner = await SalesBanner.find().sort({ createdAtcreatedAt: -1 });
      if (!banner) {
        return handleResponse(404, "Banner not found", {}, resp);
      }

      const allSalesBanner = await banner.filter(
        (banner) => banner.deleted_at === null
      );

      for (const salesBanner of allSalesBanner) {
        if (salesBanner.created_by) {
          const createdBy = await User.findOne({
            id: salesBanner.created_by,
          });
          salesBanner.created_by = createdBy;
        }
      }
      if (allSalesBanner.length == 0) {
        return handleResponse(200, "No Sales Banner data  available", {}, resp);
      }
      return handleResponse(
        200,
        "Sales banner fetched successfully",
        { allSalesBanner },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
  //get sales banner id
  static GetSalesBannerID = async (req, resp) => {
    try {
      const { id } = req.params;
      const banner = await SalesBanner.findOne({ id });
      if (!banner) {
        return handleResponse(404, "Banner not found", {}, resp);
      }
      if (banner.created_by) {
        const createdBy = await User.findOne({
          id: banner.created_by,
        });
        banner.created_by = createdBy;
      }

      return handleResponse(
        200,
        "Sales banner fetched successfully",
        { banner },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //sales banner
  static DeleteSalesBanner = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const banner = await SalesBanner.findOne({ id });
      if (!banner) {
        return handleResponse(404, "Banner not found", {}, resp);
      }

      if (banner.deleted_at === null) {
        return handleResponse(404, "Add to trash first for deleting it.", {}, resp)
      }

      await SalesBanner.findOneAndDelete({ id: id })
      return handleResponse(200, "Sales Banner Deleted Successfully", {}, resp)
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
      const banner = await SalesBanner.findOne({ id: id });

      if (!banner) {
        return handleResponse(404, "Banner not found", {}, resp);
      }
      if (banner.deleted_at !== null) {
        return handleResponse(400, "Sales Banner already added to trash,", {}, resp)
      }
      banner.deleted_at = new Date()
      await banner.save()
      return handleResponse(200, "Sales Banner Successfully updated to trash.", {}, resp)

    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //restore trash
  static RestoreTrash = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const banner = await SalesBanner.findOne({ id: id });

      if (!banner) {
        return handleResponse(404, "Banner not found", {}, resp);
      }
      if (banner.deleted_at === null) {
        return handleResponse(400, "Sales Banner already restored.", {}, resp)
      }

      banner.deleted_at = null
      await banner.save()
      return handleResponse(200, "Sales Banner successfully restored.", {}, resp)
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get trash
  static GetTrashSalesBanner = async (req, resp) => {
    try {
      const banner = await SalesBanner.find().sort({ createdAtcreatedAt: -1 });
      if (!banner) {
        return handleResponse(404, "Banner not found", {}, resp);
      }

      const allSalesBanner = await banner.filter(
        (banner) => banner.deleted_at !== null
      );
      if (allSalesBanner.length == 0) {
        return handleResponse(200, "No Sales Banner data in trash.", {}, resp);
      }
      return handleResponse(
        200,
        "Sales banner trash fetched successfully",
        { allSalesBanner },
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default SalesBannerController;
