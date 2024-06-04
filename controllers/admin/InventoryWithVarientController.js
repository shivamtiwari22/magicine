import fs from "fs";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import handleResponse from "../../config/http-response.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { model } from "mongoose";
import CustomFiled from "../../src/models/adminModel/CustomField.js";
import CustomFiledValue from "../../src/models/adminModel/CustomFieldValue.js";

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
  static GetCustomFields = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { productType, productId } = req.body;

      if (!productType || !productId) {
        return handleResponse(
          400,
          "Product type and product ID are required",
          {},
          resp
        );
      }

      let product;

      if (productType === "Product") {
        product = await Product.findOne({ id: productId });
        if (!product) {
          return handleResponse(404, "Product not found", {}, resp);
        }
      } else if (productType === "Medicine") {
        product = await Medicine.findOne({ id: productId });
        if (!product) {
          return handleResponse(404, "Medicine not found", {}, resp);
        }
      } else {
        return handleResponse(400, "Invalid product type", {}, resp);
      }

      let customFieldsSet = new Set();
      if (product.categories && product.categories.length > 0) {
        for (const key of product.categories) {
          const fields = await CustomFiled.find({ category_id: Number(key) });
          fields.forEach((field) => customFieldsSet.add(JSON.stringify(field)));
        }
        if (customFieldsSet.size === 0) {
          return handleResponse(
            404,
            "No custom fields found for the categories",
            {},
            resp
          );
        }
      }

      let customFieldsValueSet = new Set();
      if (customFieldsSet.size > 0) {
        for (const fieldStr of customFieldsSet) {
          const field = JSON.parse(fieldStr);
          const values = await CustomFiledValue.find({ custom_id: field._id });
          values.forEach((value) =>
            customFieldsValueSet.add(JSON.stringify(value))
          );
        }
        if (customFieldsValueSet.size === 0) {
          return handleResponse(404, "No custom fields value found.", {}, resp);
        }
      }

      const customFields = Array.from(customFieldsSet).map((fieldStr) =>
        JSON.parse(fieldStr)
      );
      const customFieldsValue = Array.from(customFieldsValueSet).map(
        (valueStr) => JSON.parse(valueStr)
      );

      const responseData = {
        product,
        customFields,
        customFieldsValue,
      };

      return handleResponse(200, "Item fetched", responseData, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // add inventory
  static AddVariant = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { variants, ...inventoryData } = req.body;
      const variantDatas = [];
      const images = req.files.images;

      if (
        inventoryData.modelType === "Product" ||
        inventoryData.modelType === "Medicine"
      ) {
        const model =
          inventoryData.modelType === "Product" ? Product : Medicine;
        const product = await model.findOne({ id: inventoryData.modelId });
        if (!product) {
          return handleResponse(404, "Product not found", {}, resp);
        }

        if (product.has_variant === false) {
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

      const existingWithoutInventory = await InvertoryWithoutVarient.findOne({
        modelType: inventoryData.modelType,
        modelId: inventoryData.modelId,
      });
      if (existingWithoutInventory) {
        return handleResponse(
          409,
          "This Item is already added to the inventory",
          {},
          resp
        );
      }

      const uniqueSKUs = new Set();

      for (const item of variants) {
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

        const base_url = `${req.protocol}://${req.get("host")}/api`;

        const imagePath = images
          .find((img) => img.path)
          ?.path.replace(/\\/g, "/");

        variantDatas.push({
          variant: item.variant,
          image: imagePath ? `${base_url}/${imagePath}` : null,
          sku: sku,
          mrp: item.mrp,
          selling_price: item.selling_price,
          stock_quantity: item.stock_quantity,
          attribute: item.attribute,
          attribute_value: item.attribute_value,
        });
      }

      const newInventory = new InventoryWithVarient({
        ...inventoryData,
        variants: variantDatas,
        created_by: user.id,
      });

      await newInventory.save();

      return handleResponse(201, "Inventory with variant", newInventory, resp);
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
      const { variants, ...inventoryData } = req.body;
      const images = req.files.images;

      const inventory = await InventoryWithVarient.findOne({ id });
      if (!inventory) {
        return handleResponse(404, "Inventory not found.", {}, resp);
      }

      const uniqueSKUs = new Set();

      if (variants && Array.isArray(variants)) {
        for (let i = 0; i < variants.length; i++) {
          const variant = variants[i];
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

          const inventoryVariant = inventory.variants.find(
            (v) => v.sku === sku
          );

          if (inventoryVariant) {
            return handleResponse(
              404,
              "Variant with this SKU does not exist in the inventory.",
              {},
              resp
            );
          }

          for (const key in variant) {
            if (Object.hasOwnProperty(key)) {
              inventoryVariant[key] = variant[key];
            }
          }

          if (images && images[i]) {
            const imagePath = images[i].path.replace(/\\/g, "/");
            inventoryVariant.image = `${req.protocol}://${req.get(
              "host"
            )}/api/${imagePath}`;
          }
        }
      }

      for (const key in inventoryData) {
        if (inventoryData.hasOwnProperty(key)) {
          inventory[key] = inventoryData[key];
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
