import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import handleResponse from "../../config/http-response.js";
import { response } from "express";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import User from "../../src/models/adminModel/AdminModel.js";

class InventoryWithVariantController {
  //add inventory with varient ----work remaining
  static AddVariant = async (req, resp) => {
    try {
      const { modelType, modelId, variants } = req.body;
      const user = req.user;

      if (!user) {
        return resp.status(401).json({ message: "User not found." });
      }

      const skus = variants.map((variant) => variant.sku);

      const existingSkus = await InventoryWithVarient.findOne({
        "variants.sku": { $in: skus },
      });
      const existingWithoutInventorySkus =
        await InvertoryWithoutVarient.findOne({
          "variants.sku": { $in: skus },
        });

      if (existingSkus || existingWithoutInventorySkus) {
        return handleResponse(
          400,
          "Inventory with this SKU already exists",
          {},
          resp
        );
      }

      if (modelType === "Product") {
        const item = await Product.findOne({ id: modelId });
        if (!item) {
          return handleResponse(
            400,
            "Referenced item does not exist.",
            {},
            resp
          );
        }
      }

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

  //get inventory
  static GetInventory = async (req, resp) => {
    try {
      const inventory = await InventoryWithVarient.find().sort({
        createdAt: -1,
      });
      const getInventory = await inventory.filter(
        (items) => items.deleted_at === null
      );

      if (getInventory.length == 0) {
        return handleResponse(200, "No inventory available", {}, resp);
      }

      for (const item of getInventory) {
        if (item.created_by) {
          const CreatedBy = await User.findOne({ id: item.created_by });
          item.created_by = CreatedBy;
        }
      }
      return handleResponse(
        200,
        "Inventory fetched successfully",
        getInventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get inventory by id
  static GetInventoryID = async (req, resp) => {
    try {
      const { id } = req.params;
      const inventory = await InventoryWithVarient.findOne({ id });

      if (!inventory) {
        return handleResponse(404, "Inventory not found.", {}, resp);
      }

      if (inventory.created_by) {
        const CreatedBy = await User.findOne({ id: inventory.created_by });
        inventory.created_by = CreatedBy;
      }
      return handleResponse(
        200,
        "Inventory fetched successfully",
        inventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //update inventory------work remaining
  static UpdateVariant = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const updateFields = req.body;

      console.log("Request body:", req.body);

      const inventory = await InventoryWithVarient.findOne({ id });
      if (!inventory) {
        return handleResponse(404, "Inventory not found.", {}, resp);
      }

      if (updateFields.variants && Array.isArray(updateFields.variants)) {
        inventory.variants.forEach((variant, index) => {
          if (updateFields.variants[index]) {
            Object.assign(variant, updateFields.variants[index]);
          }
        });
      }

      for (const key in updateFields) {
        if (key !== "variants" && updateFields.hasOwnProperty(key)) {
          inventory[key] = updateFields[key];
        }
      }

      await inventory.save();

      return handleResponse(
        200,
        "Inventory updated successfully.",
        inventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // soft-delete
  static SoftDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const inventory = await InventoryWithVarient.findOne({ id });
      if (!inventory) {
        return handleResponse(404, "Inventory not found", {}, resp);
      }

      if (inventory.deleted_at !== null) {
        return handleResponse(
          400,
          "Inventory already added to trash.",
          {},
          resp
        );
      }

      inventory.deleted_at = new Date();
      await inventory.save();
      return handleResponse(
        200,
        "Inventory added to trash successfully.",
        inventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // restore
  static RestoreDelete = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const inventory = await InventoryWithVarient.findOne({ id });
      if (!inventory) {
        return handleResponse(404, "Inventory not found", {}, resp);
      }

      if (inventory.deleted_at === null) {
        return handleResponse(400, "Inventory already Restored.", {}, resp);
      }

      inventory.deleted_at = null;
      await inventory.save();
      return handleResponse(
        200,
        "Inventory restored successfully.",
        inventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get gtrash
  static GetTrash = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }
      const inventory = await InventoryWithVarient.find().sort({
        createdAt: -1,
      });
      const getInventory = await inventory.filter(
        (items) => items.deleted_at !== null
      );

      if (getInventory.length == 0) {
        return handleResponse(200, "No inventory available in trash", {}, resp);
      }

      for (const item of getInventory) {
        if (item.created_by) {
          const CreatedBy = await User.findOne({ id: item.created_by });
          item.created_by = CreatedBy;
        }
      }
      return handleResponse(
        200,
        "Inventory fetched successfully",
        getInventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //delete trash
  static DeleteInventory = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;

      const invenetory = await InventoryWithVarient.findOne({ id: id });
      if (!invenetory) {
        return handleResponse(404, "Inventory not found", {}, resp);
      }

      if (invenetory.deleted_at === null) {
        return handleResponse(
          400,
          "For deleteing it add it to inventory first.",
          {},
          resp
        );
      }

      await InventoryWithVarient.findOneAndDelete({ id: id });
      return handleResponse(200, "Inventory deleted successfully", {}, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default InventoryWithVariantController;
