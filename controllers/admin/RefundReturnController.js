import Refund_return from "../../src/models/adminModel/RefundReturnPolicy.js";
import handleResponse from "../../config/http-response.js";
import User from "../../src/models/adminModel/AdminModel.js";

class RefundReturnController {
  //add Refund Return
  static AddRefundReturn = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const images = req.files;
      const { banner_image, ...refundPolicy } = req.body;

      let existingPolicy = await Refund_return.findOne({
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
        Object.assign(existingPolicy, refundPolicy);
        await existingPolicy.save();
        return handleResponse(
          200,
          "Refund Return Policy updated successfully.",
          existingPolicy,
          resp
        );
      } else {
        const newRefundReturnPolicy = new Refund_return({
          created_by: user.id,
          ...salesPolicy,
        });

        if (images && images.banner_image) {
          newRefundReturnPolicy.banner_image = `${base_url}/${images.banner_image[0].path.replace(
            /\\/g,
            "/"
          )}`;
        }

        await newRefundReturnPolicy.save();
        return handleResponse(
          201,
          "Refund Return Policy created successfully.",
          newRefundReturnPolicy,
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
  static GetRefundReturnPolicy = async (req, resp) => {
    try {
      const RefundReturn = await Refund_return.find();
      if (!RefundReturn) {
        return handleResponse(404, "No Refund Return Policy found.", {}, resp);
      }

      for (const refund of RefundReturn) {
        if (refund.created_by) {
          const createdBy = await User.findOne({
            id: refund.created_by,
          });
          refund.created_by = createdBy;
        }
      }

      return handleResponse(
        200,
        "Refund Return Policy fetched successfully.",
        RefundReturn,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default RefundReturnController;
