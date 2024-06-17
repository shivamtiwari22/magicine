// import fs from "fs";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import handleResponse from "../../config/http-response.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
// import { fileURLToPath } from "url";
// import { model } from "mongoose";
import CustomFiled from "../../src/models/adminModel/CustomField.js";
import CustomFiledValue from "../../src/models/adminModel/CustomFieldValue.js";
import Category from "../../src/models/adminModel/CategoryModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import Brand from "../../src/models/adminModel/BrandModel.js";

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const saveImageAndGetUrl = (imagePath, staticDir, baseUrl) => {
//   if (!fs.existsSync(imagePath)) {
//     throw new Error(`Source file does not exist: ${imagePath}`);
//   }

//   if (!fs.existsSync(staticDir)) {
//     fs.mkdirSync(staticDir, { recursive: true });
//   }

//   const fileName = `${Date.now()}-${path.basename(imagePath)}`;
//   const targetPath = path.join(staticDir, fileName);

//   try {
//     fs.copyFileSync(imagePath, targetPath);
//   } catch (err) {
//     console.error(`Error copying file: ${err.message}`);
//     throw err;
//   }

//   return `${baseUrl}/${fileName}`;
// };

class InventoryWithVarientController {
  // get attributes
  static GetCustomFields = async (req, resp) => {
    try {
      const { modelType, modelId } = req.params;

      if (!modelType || !modelId) {
        return handleResponse(
          400,
          "Product type and product ID are required",
          {},
          resp
        );
      }

      let product;

      if (modelType === "Product") {
        product = await Product.findOne({ id: modelId });
        if (!product) {
          return handleResponse(404, "Product not found", {}, resp);
        }
      } else if (modelType === "Medicine") {
        product = await Medicine.findOne({ id: modelId });
        if (!product) {
          return handleResponse(404, "Medicine not found", {}, resp);
        }
      } else {
        return handleResponse(400, "Invalid product type", {}, resp);
      }

      let customFieldsSet = new Set();
      if (product.category && product.category.length > 0) {
        for (const key of product.category) {
          const fields = await CustomFiled.find({ category_id: Number(key) });
          fields.forEach((field) => customFieldsSet.add(JSON.stringify(field)));
        }
        if (customFieldsSet.size === 0) {
          return handleResponse(
            404,
            "No custom fields found for the category",
            {},
            resp
          );
        }
      }

      const customFields = [];
      for (const key of customFieldsSet) {
        const field = JSON.parse(key);
        const values = await CustomFiledValue.find({ custom_id: field._id });
        const fieldObject = {
          _id: field._id,
          id: field.id,
          attribute_name: field.attribute_name,
          values: values.map((item) => item),
        };
        customFields.push(fieldObject);
      }

      const responseData = {
        customFields,
      };

      return handleResponse(200, "Item fetched", responseData, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // add inventory with varient
  static AddInventory = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const rawData = req.body;

      const files = req.files;

      const base_url = `${req.protocol}://${req.get("host")}/api`;

      const inventoryData = await Promise.all(
        rawData.inventoryData?.map(async (item, index) => {
          if (!item) {
            return handleResponse(400, "Invalid inventory data", {}, resp);
          }

          if (item.modelType == "Product") {
            const product = await Product.findOne({ id: item.modelId });
            if (!product || product.has_variant !== true) {
              return handleResponse(
                400,
                "This Product Must Have Variant",
                {},
                resp
              );
            }
          }

          if (item.modelType == "Medicine") {
            const medicine = await Medicine.findOne({ id: item.modelId });
            if (!medicine || medicine.has_variant !== true) {
              return handleResponse(
                400,
                "This Medicine Must Have Variant",
                {},
                resp
              );
            }
          }

          const imageField = `inventoryData[${index}][image]`;
          const imageFile = files.find((file) => file.fieldname === imageField);

          const attributes = Array.isArray(item.attribute)
            ? item.attribute
            : JSON.parse(item.attribute || "[]");
          const attributeValues = Array.isArray(item.attribute_value)
            ? item.attribute_value
            : JSON.parse(item.attribute_value || "[]");

          return {
            modelType: item.modelType,
            modelId: item.modelId,
            sku: item.sku,
            variant: item.variant,
            mrp: item.mrp,
            selling_price: item.selling_price,
            stock_quantity: item.stock_quantity,
            attribute: attributes,
            attribute_value: attributeValues,
            image: imageFile
              ? `${base_url}/${imageFile.path.replace(/\\/g, "/")}`
              : null,
            created_by: user.id,
          };
        })
      );

      const skuSet = new Set();
      inventoryData.forEach((item, index) => {
        if (skuSet.has(item.sku)) {
          throw new Error(`SKU "${item.sku}" already exists.`);
        }
        skuSet.add(item.sku);
      });

      const existingSKUs = await InventoryWithVarient.find({
        sku: { $in: Array.from(skuSet) },
      });
      if (existingSKUs.length > 0) {
        throw new Error(
          `One or more SKUs already exist in InventoryWithVarient.`
        );
      }
      const existingSKUsWithoutVariant = await InvertoryWithoutVarient.find({
        sku: { $in: Array.from(skuSet) },
      });
      if (existingSKUsWithoutVariant.length > 0) {
        throw new Error(
          `One or more SKUs already exist in InventoryWithoutVariant.`
        );
      }

      const validationErrors = [];
      inventoryData.forEach((item, index) => {
        if (!item.modelType)
          validationErrors.push({
            field: `inventoryData[${index}][modelType]`,
            message: "Path `modelType` is required.",
          });
        if (!item.modelId)
          validationErrors.push({
            field: `inventoryData[${index}][modelId]`,
            message: "Path `modelId` is required.",
          });
        if (!item.sku)
          validationErrors.push({
            field: `inventoryData[${index}][sku]`,
            message: "Path `sku` is required.",
          });
        if (!item.mrp)
          validationErrors.push({
            field: `inventoryData[${index}][mrp]`,
            message: "Path `mrp` is required.",
          });
        if (!item.selling_price)
          validationErrors.push({
            field: `inventoryData[${index}][selling_price]`,
            message: "Path `selling_price` is required.",
          });
        if (!item.stock_quantity)
          validationErrors.push({
            field: `inventoryData[${index}][stock_quantity]`,
            message: "Path `stock_quantity` is required.",
          });
        if (!item.variant)
          validationErrors.push({
            field: `inventoryData[${index}][variant]`,
            message: "Path `variant` is required.",
          });
      });

      if (validationErrors.length > 0) {
        return handleResponse(
          400,
          "Validation error.",
          { errors: validationErrors },
          resp
        );
      }

      const savedInventory = await InventoryWithVarient.insertMany(
        inventoryData
      );

      return handleResponse(
        201,
        "Inventory with variant created successfully",
        savedInventory,
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

  //get varient product
  static GetVarientProduct = async (req, resp) => {
    try {
      const uniqueProducts = await InventoryWithVarient.aggregate([
        { $group: { _id: { modelType: "$modelType", modelId: "$modelId" } } },
        {
          $project: {
            _id: 0,
            modelType: "$_id.modelType",
            modelId: "$_id.modelId",
          },
        },
      ]);

      const productsWithVariants = [];

      for (const product of uniqueProducts) {
        const variants = await InventoryWithVarient.find({
          modelType: product.modelType,
          modelId: product.modelId,
        });

        productsWithVariants.push({
          modelType: product.modelType,
          modelId: product.modelId,
          variants: variants,
        });
      }

      for (const key of productsWithVariants) {
        if (key.modelType === "Product") {
          const product = await Product.findOne({ id: key.modelId });
          key.modelId = product;
        }
        if (key.modelType === "Medicine") {
          const product = await Medicine.findOne({ id: key.modelId });
          key.modelId = product;
        }

        if (key.modelId.marketer) {
          const marketerData = await Marketer.findOne({
            id: key.modelId.marketer,
          });
          key.modelId.marketer = marketerData;
        }

        if (key.modelId.brand) {
          const brandData = await Brand.findOne({ id: key.modelId.brand });
          key.modelId.brand = brandData;
        }
      }

      return handleResponse(
        200,
        "Inventory with variants fetched successfully.",
        { productsWithVariants },
        resp
      );
    } catch (error) {
      return handleResponse(500, error.message, {}, resp);
    }
  };

  //get variants only
  static GetVarientsOnly = async (req, resp) => {
    try {
      const { modelType, modelId } = req.params;

      if (!modelType || !modelId) {
        return handleResponse(
          400,
          "modelType and modelId are required parameters",
          {},
          resp
        );
      }

      const variants = await InventoryWithVarient.find({
        modelType: modelType,
        modelId: modelId,
      });

      if (variants.length < 1) {
        return handleResponse(404, "No Inventory found", {}, resp);
      }

      return handleResponse(
        200,
        "Variants data fetched successfully",
        variants,
        resp
      );
    } catch (error) {
      return handleResponse(500, error.message, {}, resp);
    }
  };

  //update variants
  static UpdateInventoryWithVariants = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { modelType, modelId } = req.params;

      if (!modelType || !modelId) {
        return handleResponse(
          401,
          "Model type or model ID is missing",
          {},
          resp
        );
      }

      const rawData = req.body;
      const files = req.files;
      const base_url = `${req.protocol}://${req.get("host")}/api`;

      if (!req.files || Object.keys(req.files).length === 0) {
        const existingInventory = await InventoryWithVarient.find({
          modelType: modelType,
          modelId: modelId,
        });

        if (existingInventory.length === 0) {
          return handleResponse(404, "No inventory found", {}, resp);
        }

        return handleResponse(
          200,
          "No files uploaded, showing existing inventory",
          existingInventory,
          resp
        );
      }

      const existingInventory = await InventoryWithVarient.find({
        modelType: modelType,
        modelId: modelId,
      });

      if (existingInventory.length === 0) {
        return handleResponse(404, "No inventory found", {}, resp);
      }

      const updatedInventory = await Promise.all(
        Object.keys(rawData.inventoryData).map(async (key) => {
          const itemIndex = parseInt(key);
          if (
            isNaN(itemIndex) ||
            itemIndex < 0 ||
            itemIndex >= existingInventory.length
          ) {
            throw new Error(`Invalid index ${key} provided for inventoryData.`);
          }

          const item = rawData.inventoryData[key];
          const existingItem = existingInventory[itemIndex];

          const imageField = `inventoryData[${key}][image]`;
          const imageFile = files.find((file) => file.fieldname === imageField);

          if (imageFile) {
            existingItem.image = `${base_url}/${imageFile.path.replace(
              /\\/g,
              "/"
            )}`;
          }

          Object.keys(item).forEach((field) => {
            if (field !== "image") {
              existingItem[field] = item[field];
            }
          });

          return existingItem.save();
        })
      );

      return handleResponse(
        200,
        "Inventory updated successfully",
        updatedInventory,
        resp
      );
    } catch (error) {
      console.error("Error updating inventory:", error);
      return handleResponse(500, error.message, {}, resp);
    }
  };
}

export default InventoryWithVarientController;
