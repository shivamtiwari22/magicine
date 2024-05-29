import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import handleResponse from "../../config/http-response.js";
import { response } from "express";

class InventoryWithVariantController {
  //add inventory with varient
  static AddVariant = async (req, resp) => {
    try {
      const { modelType, modelId, variants } = req.body;
      const user = req.user;

      if (!user) {
        return resp.status(401).json({ message: "User not found." });
      }

      // console.log(variants);
      const variantData = variants.map((variant, index) => {
        const image =
          req.files &&
          req.files[`variants[${index}][image]`] &&
          req.files[`variants[${index}][image]`].length > 0
            ? `/public/inventory-variant/images/${
                req.files[`variants[${index}][image]`][0].filename
              }`
            : null;
        return { ...variant, image };
      });

      const newInventory = new InventoryWithVarient({
        modelType,
        modelId,
        variants: variantData,
        created_by: user.id,
      });

      await newInventory.save();

      return handleResponse(
        201,
        "Inventory created successfully",
        newInventory,
        resp
      );
    } catch (err) {
      if (err.name === "ValidationError") {
        const validationErrors = Object.keys(err.errors).map((field) => ({
          field: field,
          message: err.errors[field].message,
        }));
        return resp.status(400).json({
          message: "Validation error.",
          errors: validationErrors,
        });
      } else {
        return handleResponse(500, err.message, {}, resp);
      }
    }
  };
}

export default InventoryWithVariantController;
