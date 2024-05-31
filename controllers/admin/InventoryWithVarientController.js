import fs from "fs";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import handleResponse from "../../config/http-response.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const saveImageAndGetUrl = (imagePath, staticDir, baseUrl) => {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Source file does not exist: ${imagePath}`);
  }

  if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${path.basename(imagePath)}`;
  const targetPath = path.join(staticDir, fileName);

  try {
    fs.copyFileSync(imagePath, targetPath);
  } catch (err) {
    console.error(`Error copying file: ${err.message}`);
    throw err;
  }

  return `${baseUrl}/${fileName}`;
};

class InventoryWithVariantController {
  //add inventory with varient
  static AddVariant = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return resp.status(401).json({ message: "User not found." });
      }

      const { ...inventoryData } = req.body;
      const { image, ...variantsData } = req.body.variants;
      const variantsDatas = [];

      if (inventoryData.modelType === "Product") {
        const items = await Product.findOne({ id: inventoryData.modelId });
        if (!items) {
          return handleResponse(404, "Product not found.", {}, resp);
        }

        if (items.has_variant === false) {
          return handleResponse(
            404,
            "This Product must not have any variants.",
            {},
            resp
          );
        }
      } else if (inventoryData.modelType === "Medicine") {
        const items = await Medicine.findOne({ id: inventoryData.modelId });
        if (!items) {
          return handleResponse(404, "Medicine not found.", {}, resp);
        }

        if (items.has_variant === false) {
          return handleResponse(
            404,
            "This Product must not have any variants.",
            {},
            resp
          );
        }
      }

      const existingInventory = await InventoryWithVarient.findOne({
        modelType: inventoryData.modelType,
        modelId: inventoryData.modelId,
      });
      if (existingInventory) {
        return handleResponse(
          409,
          "This Item is already added to the inventory",
          {},
          resp
        );
      }

      const staticDir = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "inventory-variant",
        "images"
      );
      const baseUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/public/inventory-variant/images`;

      const uniqueSKUs = new Set();

      for (const key in variantsData) {
        if (variantsData.hasOwnProperty(key)) {
          const item = variantsData[key];
          const { sku } = item;

          if (uniqueSKUs.has(sku)) {
            return handleResponse(
              409,
              "Variant SKUs must be unique.",
              { duplicateSKU: sku },
              resp
            );
          }

          uniqueSKUs.add(sku);

          const existingVariant = await InventoryWithVarient.findOne({ sku });
          const existingWithoutVariant = await InvertoryWithoutVarient.findOne({
            sku,
          });

          if (existingVariant || existingWithoutVariant) {
            return handleResponse(
              409,
              "Variant with this SKU already exists.",
              {},
              resp
            );
          }

          const imageUrl = saveImageAndGetUrl(item.image, staticDir, baseUrl);

          variantsDatas.push({
            variant: item.variant,
            image: imageUrl,
            sku: sku,
            mrp: item.mrp,
            selling_price: item.selling_price,
            stock_quantity: item.stock_quantity,
            attribute: item.attribute,
            attribute_value: item.attribute_value,
          });
        }
      }

      const newInventory = InventoryWithVarient({
        ...inventoryData,
        created_by: user.id,
        variants: variantsDatas,
      });
      await newInventory.save();

      return handleResponse(
        201,
        "Inventory created successfully.",
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
      const getInventory = inventory.filter(
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

  //update inventory
  static UpdateVariant = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found.", {}, resp);
      }

      const { id } = req.params;
      const updateFields = req.body;

      const inventory = await InventoryWithVarient.findOne({ id });
      if (!inventory) {
        return handleResponse(404, "Inventory not found.", {}, resp);
      }

      const staticDir = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "inventory-variant",
        "images"
      );
      const baseUrl = `${req.protocol}://${req.get(
        "host"
      )}/api/public/inventory-variant/images`;

      const uniqueSKUs = new Set();

      if (updateFields.variants && Array.isArray(updateFields.variants)) {
        for (let i = 0; i < updateFields.variants.length; i++) {
          const variant = updateFields.variants[i];
          const { sku } = variant;

          if (uniqueSKUs.has(sku)) {
            return handleResponse(
              409,
              "Variant SKUs must be unique.",
              { duplicateSKU: sku },
              resp
            );
          }

          uniqueSKUs.add(sku);

          const existingVariant = await InventoryWithVarient.findOne({
            sku: sku,
            id: { $ne: id },
          });
          const existingWithoutVariant = await InvertoryWithoutVarient.findOne({
            sku,
          });

          if (existingVariant || existingWithoutVariant) {
            return handleResponse(
              409,
              "Variant with this SKU already exists.",
              {},
              resp
            );
          }

          if (variant.image) {
            variant.image = saveImageAndGetUrl(
              variant.image,
              staticDir,
              baseUrl
            );
          }

          inventory.variants[i] = {
            ...inventory.variants[i].toObject(),
            ...variant,
          };
        }
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
