import Privacy_policy from "../../src/models/adminModel/PrivacyPolicymodel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class PrivacyPolicyController {
  //add customer policy
  static AddPrivacyPolicy = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { banner_image, ...privacyPolicy } = req.body;

      let existingPolicy = await Privacy_policy.findOne({
        created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}/api`;

      if (existingPolicy) {
        if (images && images.banner_image) {
          existingPolicy.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }
        Object.assign(existingPolicy, privacyPolicy);
        await existingPolicy.save();
        return handleResponse(
          200,
          "Privacy Policy updated successfully.",
          existingPolicy,
          resp
        );
      } else {
        const newprivacypolicy = new Privacy_policy({
          created_by: user.id,
          ...privacyPolicy,
        });

        if (images && images.banner_image) {
          newprivacypolicy.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newprivacypolicy.save();
        return handleResponse(
          201,
          "Privacy Policy created successfully.",
          newprivacypolicy,
          resp
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
          resp
        );
      } else {
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };

  //get customer policy
  static GetPrivacyPolicy = async (req, resp) => {
    try {
      const privacyPolicy = await Privacy_policy.find();
      if (!privacyPolicy) {
        return handleResponse(
          404,
          "No Privacy Policy found.",
          {},
          resp
        );
      }

      for (const shipping of privacyPolicy) {
        if (shipping.created_by) {
          const createdBy = await User.findOne({
            id: shipping.created_by,
          });
          shipping.created_by = createdBy;
        }
      }

      return handleResponse(
        200,
        "Privacy Policy fetched successfully.",
        privacyPolicy,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default PrivacyPolicyController;
