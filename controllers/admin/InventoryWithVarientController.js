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
import { addAbortListener } from "events";

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
        rawData.inventoryData.map(async (item, index) => {
          if (item.modelType == "Product") {
            const product = await Product.findOne({ id: item.modelId });
            if (!product || product.has_variant === false) {
              return handleResponse(
                400,
                "This Product Must Have Variant",
                {},
                resp
              );
            }
          } else if (item.modelType == "Medicine") {
            const medicine = await Medicine.findOne({ id: item.modelId });
            if (!medicine || medicine.has_varient === false) {
              return handleResponse(
                400,
                "This Medicine Must Have Variant",
                {},
                resp
              );
            }
          } else {
            return handleResponse(400, "Invalid modelType", {}, resp);
          }

          const imageField = `inventoryData[${index}][image]`;
          const imageFile = files.find((file) => file.fieldname === imageField);

          return {
            modelType: item.modelType,
            modelId: item.modelId,
            sku: item.sku,
            variant: item.variant,
            mrp: item.mrp,
            selling_price: item.selling_price,
            stock_quantity: item.stock_quantity,
            attribute: item.attribute,
            attribute_value: item.attribute_value,
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
        if (!item.attribute)
          validationErrors.push({
            field: `inventoryData[${index}][attribute]`,
            message: "Path `attribute` is required.",
          });
        if (!item.attribute_value)
          validationErrors.push({
            field: `inventoryData[${index}][attribute_value]`,
            message: "Path `attribute_value` is required.",
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
        200,
        "Inventory with variant added successfully",
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

  // static UpdateInventoryWithVariants = async (req, resp) => {
  //   try {
  //     const { user } = req;
  //     if (!user) {
  //       return handleResponse(401, "User not found", {}, resp);
  //     }

  //     const { modelType, modelId } = req.params;

  //     if (!modelType || !modelId) {
  //       return handleResponse(
  //         400,
  //         "modelType and modelId are required parameters",
  //         {},
  //         resp
  //       );
  //     }

  //     const existingVariants = await InventoryWithVarient.find({
  //       modelType: modelType,
  //       modelId: modelId,
  //     });

  //     if (existingVariants.length === 0) {
  //       return handleResponse(
  //         404,
  //         "No variants found for the given modelType and modelId",
  //         {},
  //         resp
  //       );
  //     }

  //     const updateData = req.body;
  //     console.log(updateData);

  //     for (const variant of existingVariants) {
  //       if (updateData[variant.id.toString()]) {
  //         const variantUpdate = updateData[variant.id.toString()];

  //         for (const key in variantUpdate) {
  //           if (Object.hasOwnProperty.call(variantUpdate, key)) {
  //             variant[key] = variantUpdate[key];
  //           }
  //         }

  //         if (req.files && req.files[variant.id.toString()]) {
  //           const imageFile = req.files[variant.id.toString()];
  //           const imageUrl = await uploadImage(imageFile);
  //           variant.image = imageUrl;
  //         }

  //         await variant.save();
  //       }
  //     }

  //     return handleResponse(
  //       200,
  //       "Inventory variants updated successfully",
  //       existingVariants,
  //       resp
  //     );
  //   } catch (error) {
  //     return handleResponse(500, error.message, {}, resp);
  //   }
  // };
}

export default InventoryWithVarientController;
