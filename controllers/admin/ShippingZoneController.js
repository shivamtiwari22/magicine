import Shipping_policy from "../../src/models/adminModel/ShippingPolicyModel";
import handleResponse from "../../config/http-response.js";

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

      const newShippingPolicy = new Shipping_policy({
        banner_image,
        created_by: user.id,
        ...salesPolicy,
      });

      if (images && images.banner_image) {
        newShippingPolicy.banner_image = images.banner_image[0].path;
      }

      await newShippingPolicy.save();
      return handleResponse(
        201,
        "Shipping Policy created successfully.",
        { newShippingPolicy },
        resp
      );
    } catch (err) {
      return handleResponse(500, "Internal Server Error", {}, resp);
    }
  };
}


export default ShippingPolicyController;