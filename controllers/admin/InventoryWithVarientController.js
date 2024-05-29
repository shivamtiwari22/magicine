import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import handleResponse from "../../config/http-response.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";

class InventoryWithVarientController {
  static AddVariant = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      let variants = req.body;
      console.log(variants);

      if (!Array.isArray(variants)) {
        variants = [variants];
      }

      const savedVariants = [];

      for (let i = 0; i < variants.length; i++) {
        const varientData = variants[i];
        const { ...varData } = varientData;
        const images = req.files;

        //existing inventory
        const inventoryWithVariant = await InventoryWithVarient.findOne({
          sku: varData.sku,
        });

        if (inventoryWithVariant) {
          return handleResponse(
            404,
            "Product already added to inventory.",
            {},
            resp
          );
        }

        let existingProduct;
        if (varData.modelType === "Product") {
          existingProduct = await Product.findOne({
            id: varData.modelId,
          });
        } else if (varData.modelType === "Medicine") {
          existingProduct = await Medicine.findOne({
            id: varData.modelId,
          });
        }

        if (existingProduct && existingProduct.has_variant === false) {
          return handleResponse(
            400,
            `This ${varData.modelType.toLowerCase()} must not have any variant.`,
            {},
            resp
          );
        }

        const newWithVariant = new InventoryWithVarient({
          ...varData,
          created_by: user.id,
        });

        const base_url = `${req.protocol}://${req.get("host")}/api`;

        const imageFieldName = `image${i}`;
        if (images && images[imageFieldName]) {
          newWithVariant.image = `${base_url}/${images[
            imageFieldName
          ][0].path.replace(/\\/g, "/")}`;
        }

        await newWithVariant.save();
        savedVariants.push(newWithVariant);
      }

      return handleResponse(
        201,
        "Inventory created successfully.",
        savedVariants,
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

  static GetVarient = async (req, resp) => {
    try {
      const inventory = await InventoryWithVarient.find().sort({
        createdAt: -1,
      });
      const allInventory = inventory.filter(
        (inventory) => inventory.deleted_at === null
      );
      if (allInventory.length == 0) {
        return handleResponse(200, "No inventory available.", {}, resp);
      }
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}
export default InventoryWithVarientController;
