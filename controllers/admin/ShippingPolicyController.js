import Shipping_policy from "../../src/models/adminModel/ShippingPolicyModel.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class ShippingPolicyController {
  //add shipping
  static AddShippingPolicy = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { banner_image, ...salesPolicy } = req.body;

      let existingPolicy = await Shipping_policy.findOne({
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
        Object.assign(existingPolicy, salesPolicy);
        await existingPolicy.save();
        return handleResponse(
          200,
          "Shipping Policy updated successfully.",
          existingPolicy,
          resp
        );
      } else {
        const newShippingPolicy = new Shipping_policy({
          // banner_image,
          created_by: user.id,
          ...salesPolicy,
        });

        if (images && images.banner_image) {
          newShippingPolicy.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newShippingPolicy.save();
        return handleResponse(
          201,
          "Shipping Policy created successfully.",
          newShippingPolicy,
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

  //get shipping
  static GetShippingPolicy = async (req, resp) => {
    try {
      const shippingPolicy = await Shipping_policy.find();
      if (!shippingPolicy) {
        return handleResponse(404, "No Shipping Policy found.", {}, resp);
      }

      for (const shipping of shippingPolicy) {
        if (shipping.created_by) {
          const createdBy = await User.findOne({
            id: shipping.created_by,
          });
          shipping.created_by = createdBy;
        }
      }

      return handleResponse(
        200,
        "Shipping Policy fetched successfully.",
        shippingPolicy,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default ShippingPolicyController;
