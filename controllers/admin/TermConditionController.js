import Term_condition from "../../src/models/adminModel/TermConditionModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class TermConditionController {
  //add Terms and conditio
  static AddTermCondition = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { banner_image, ...termConditionPolicy } = req.body;

      let existingPolicy = await Term_condition.findOne({
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
        Object.assign(existingPolicy, termConditionPolicy);
        await existingPolicy.save();
        return handleResponse(
          200,
          "Term & Condition Policy updated successfully.",
          existingPolicy,
          resp
        );
      } else {
        const newCustomerSupport = new Term_condition({
          created_by: user.id,
          ...termConditionPolicy,
        });

        if (images && images.banner_image) {
          newCustomerSupport.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newCustomerSupport.save();
        return handleResponse(
          201,
          "Term & Condition Policy created successfully.",
          newCustomerSupport,
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

  //get Terms and conditio
  static GetTermConditionPolicy = async (req, resp) => {
    try {
      const customerSupport = await Term_condition.find();
      if (!customerSupport) {
        return handleResponse(
          404,
          "No Term & Condition Policy found.",
          {},
          resp
        );
      }

      for (const shipping of customerSupport) {
        if (shipping.created_by) {
          const createdBy = await User.findOne({
            id: shipping.created_by,
          });
          shipping.created_by = createdBy;
        }
      }

      return handleResponse(
        200,
        "Term & Condition Policy fetched successfully.",
        customerSupport,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default TermConditionController;
