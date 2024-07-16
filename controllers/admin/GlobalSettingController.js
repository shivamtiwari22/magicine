import handleResponse from "../../config/http-response.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import Global from "../../src/models/adminModel/GlobalModel.js";

class GlobalSetting {
  static addOrUpdateGlobal = async (req, res) => {
    try {
      const user = req.user;

      const images = req.files;
      const { logo, socialMedia, icon_image, ...globalSetting } = req.body;

      let existingGlobal = await Global.findOne({
        created_by: user.id,
      });

      if (existingGlobal) {
        const base_url = `${req.protocol}://${req.get("host")}`;

        if (images && images.logo) {
          existingGlobal.logo = `${base_url}/${images.logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.icon_image) {
          existingGlobal.icon_image = `${base_url}/${images.icon_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.instagram_logo) {
          existingGlobal.instagram_logo = `${base_url}/${images.instagram_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.facebook_logo) {
          existingGlobal.facebook_logo = `${base_url}/${images.facebook_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.x_logo) {
          existingGlobal.x_logo = `${base_url}/${images.x_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.youtube_logo) {
          existingGlobal.youtube_logo = `${base_url}/${images.youtube_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.linkdin_logo) {
          existingGlobal.linkdin_logo = `${base_url}/${images.linkdin_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.pinterest_logo) {
          existingGlobal.pinterest_logo = `${base_url}/${images.pinterest_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        Object.assign(existingGlobal, globalSetting);
        await existingGlobal.save();
        return handleResponse(
          200,
          "global settings updated successfully.",
          existingGlobal,
          res
        );
      } else {
        const newShippingPolicy = new Global({
          created_by: user.id,
          ...globalSetting,
        });

        if (newShippingPolicy) {
          const base_url = `${req.protocol}://${req.get("host")}`;

          if (images && images.logo) {
            newShippingPolicy.logo = `${base_url}/${images.logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.icon_image) {
            newShippingPolicy.icon_image = `${base_url}/${images.icon_image[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.instagram_logo) {
            newShippingPolicy.instagram_logo = `${base_url}/${images.instagram_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.facebook_logo) {
            newShippingPolicy.facebook_logo = `${base_url}/${images.facebook_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.x_logo) {
            newShippingPolicy.x_logo = `${base_url}/${images.x_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.youtube_logo) {
            newShippingPolicy.youtube_logo = `${base_url}/${images.youtube_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.linkdin_logo) {
            newShippingPolicy.linkdin_logo = `${base_url}/${images.linkdin_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.pinterest_logo) {
            newShippingPolicy.pinterest_logo = `${base_url}/${images.pinterest_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }
        }

        await newShippingPolicy.save();
        return handleResponse(
          201,
          "Global Settings Created successfully.",
          { newShippingPolicy },
          res
        );
      }
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
          res
        );
      } else {
        return handleResponse(500, err.message, {}, res);
      }
    }
  };

  static getGlobalSetting = async (req, res) => {
    try {
      const firstRecord = await Global.findOne().sort({ _id: 1 }).exec();
      if (!firstRecord) {
        return handleResponse(200, "Not Found", {}, res);
      }

      handleResponse(200, "global setting get successfully", firstRecord, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };



}

export default GlobalSetting;
