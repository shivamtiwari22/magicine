import handleResponse from "../../config/http-response.js";
import Global from "../../src/models/adminModel/GlobalModel.js";

class GlobalSetting {
  static addOrUpdateGlobal = async (req, res) => {
    try {
      const user = req.user;

      const images = req.files;
      const { files, body, protocol, get } = req;
      const { logo, socialMedia, icon_image, ...globalSetting } = req.body;

      let existingGlobal = await Global.findOne({
        created_by: user.id,
      });

      if (existingGlobal) {
        const base_url = `${req.protocol}://${req.get("host")}/api`;

        if (files && files.logo) {
          existingGlobal.logo = `${base_url}/${files.logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (files && files.icon_image) {
          existingGlobal.icon_image = `${base_url}/${files.icon_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.instagram_logo) {
          existingGlobal.socialMedia[0].logo = `${base_url}/${files.instagram_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.facebook_logo) {
          existingGlobal.socialMedia[1].logo = `${base_url}/${files.facebook_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.x_logo) {
          existingGlobal.socialMedia[2].logo = `${base_url}/${files.x_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.youtube_logo) {
          existingGlobal.socialMedia[3].logo = `${base_url}/${files.youtube_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.linkdin_logo) {
          existingGlobal.socialMedia[4].logo = `${base_url}/${files.linkdin_logo[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        if (images && images.pinterest_logo) {
          existingGlobal.socialMedia[5].logo = `${base_url}/${files.pinterest_logo[0].path.replace(
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
          const base_url = `${req.protocol}://${req.get("host")}/api`;

          if (files && files.logo) {
            newShippingPolicy.logo = `${base_url}/${files.logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (files && files.icon_image) {
            newShippingPolicy.icon_image = `${base_url}/${files.icon_image[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.instagram_logo) {
            newShippingPolicy.socialMedia[0].logo = `${base_url}/${files.instagram_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.facebook_logo) {
            newShippingPolicy.socialMedia[1].logo = `${base_url}/${files.facebook_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.x_logo) {
            newShippingPolicy.socialMedia[2].logo = `${base_url}/${files.x_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.youtube_logo) {
            newShippingPolicy.socialMedia[3].logo = `${base_url}/${files.youtube_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.linkdin_logo) {
            newShippingPolicy.socialMedia[4].logo = `${base_url}/${files.linkdin_logo[0].path.replace(
              /\\/g,
              "/"
            )}`;
          }

          if (images && images.pinterest_logo) {
            newShippingPolicy.socialMedia[5].logo = `${base_url}/${files.pinterest_logo[0].path.replace(
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
        handleResponse(404, "NotFound", {}, res);
      }

      handleResponse(200, "global setting get successfully", firstRecord, res);
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };
}

export default GlobalSetting;
