import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import handleResponse from "../../config/http-response.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import Brand from "../../src/models/adminModel/BrandModel.js";
import Marketer from "../../src/models/adminModel/ManufacturerModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import csvtojson from "csvtojson";
import fs from "fs";
import SequenceModel from "../../src/models/sequence.js";
import { format } from "fast-csv";
import moment from "moment";

const getNextSequenceValue = async (modelName) => {
  let sequence = await SequenceModel.findOneAndUpdate(
    { modelName: modelName },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, new: true }
  );
  return sequence.sequenceValue;
};

class InvertoryWithoutVarientController {
  // Search products and medicine api
  static SearchProductsAndMedicine = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { product_name } = req.query;

      const baseQuery = {};
      if (product_name) {
        baseQuery.product_name = { $regex: product_name, $options: "i" };
      }

      const products = await Product.find(baseQuery);
      const medicines = await Medicine.find(baseQuery);

      const productIds = products.map((product) => product.id);
      const medicineIds = medicines.map((medicine) => medicine.id);

      const existingProductInInventoryWithVarient =
        await InventoryWithVarient.find({
          modelType: "Product",
          modelId: { $in: productIds },
        });

      const existingProductInInventoryWithOutVarient =
        await InvertoryWithoutVarient.find({
          "item.itemType": "Product",
          "item.itemId._id": { $in: productIds },
        });

      const existingMedicineInInventoryWithVarient =
        await InventoryWithVarient.find({
          modelType: "Medicine",
          modelId: { $in: medicineIds },
        });

      const existingMedicineInInventoryWithOutVarient =
        await InvertoryWithoutVarient.find({
          "item.itemType": "Medicine",
          "item.itemId._id": { $in: medicineIds },
        });

      const existingProductIds = new Set([
        ...existingProductInInventoryWithVarient.map((item) => item.modelId),
        ...existingProductInInventoryWithOutVarient.map((item) =>
          item.item.itemId._id.toString()
        ),
      ]);

      const existingMedicineIds = new Set([
        ...existingMedicineInInventoryWithVarient.map((item) => item.modelId),
        ...existingMedicineInInventoryWithOutVarient.map((item) =>
          item.item.itemId._id.toString()
        ),
      ]);

      const filteredProducts = products.filter(
        (product) => !existingProductIds.has(product.id)
      );
      const filteredMedicines = medicines.filter(
        (medicine) => !existingMedicineIds.has(medicine.id)
      );

      const combinedResults = [...filteredProducts, ...filteredMedicines];

      if (combinedResults.length < 1) {
        return handleResponse(200, "No data available", {}, resp);
      }

      for (const item of combinedResults) {
        if (item.marketer) {
          const getMarketer = await Marketer.findOne({ id: item.marketer });
          item.marketer = getMarketer;
        }
        if (item.brand) {
          const getBrand = await Brand.findOne({ id: item.brand });
          item.brand = getBrand;
        }
      }

      return handleResponse(200, "Success", combinedResults, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // Add inventory without varient api
  static AddInventoryWithoutVarient = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const inventoryWithoutVarientData = req.body;

      if (
        !inventoryWithoutVarientData.item ||
        !inventoryWithoutVarientData.item.itemType ||
        !inventoryWithoutVarientData.item.itemId
      ) {
        return handleResponse(
          400,
          "Item type and item ID are required.",
          {},
          resp
        );
      }

      const itemType = inventoryWithoutVarientData.item.itemType;
      const itemId = inventoryWithoutVarientData.item.itemId;

      let itemExists;
      if (itemType === "Product") {
        itemExists = await Product.findOne({ id: itemId });
        if (!itemExists) {
          return handleResponse(
            200,
            "Referenced product does not exist.",
            {},
            resp
          );
        }
        if (itemExists.has_variant === true) {
          return handleResponse(
            400,
            "Product with this ID must have variants.",
            {},
            resp
          );
        }
      } else if (itemType === "Medicine") {
        itemExists = await Medicine.findOne({ id: itemId });
        if (!itemExists) {
          return handleResponse(
            200,
            "Referenced medicine does not exist.",
            {},
            resp
          );
        }
        if (itemExists.has_variant === true) {
          return handleResponse(
            400,
            "Medicine with this ID must have variants.",
            {},
            resp
          );
        }
      }

      const existingInventory = await InventoryWithVarient.findOne({
        sku: inventoryWithoutVarientData.sku,
      });
      const existingWithoutInventory = await InvertoryWithoutVarient.findOne({
        sku: inventoryWithoutVarientData.sku,
      });

      if (existingInventory || existingWithoutInventory) {
        return handleResponse(
          400,
          "Inventory with this SKU already exists.",
          {},
          resp
        );
      }

      const newInventory = new InvertoryWithoutVarient({
        ...inventoryWithoutVarientData,
        created_by: user.id,
      });

      await newInventory.save();

      return handleResponse(
        201,
        "Inventory added successfully.",
        newInventory,
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

  //get inventory without varient
  static GetInventoryWithoutVarient = async (req, resp) => {
    try {
      const inventory = await InvertoryWithoutVarient.find().sort({
        createdAt: -1,
      });

      const allInventory = inventory.filter(
        (inventory) => inventory.deleted_at === null
      );

      if (allInventory.length == 0) {
        return handleResponse(
          200,
          "No inventory without varient available.",
          {},
          resp
        );
      }

      for (const item of allInventory) {
        if (item.created_by) {
          const CreatedBy = await User.findOne({ id: item.created_by });
          item.created_by = CreatedBy;
        }
        if (item.item.itemType === "Product" && item.item.itemId) {
          const itemData = await Product.findOne({ id: item.item.itemId });
          item.item.itemId = itemData;
        }
        if (item.item.itemType === "Medicine" && item.item.itemId) {
          const itemData = await Medicine.findOne({ id: item.item.itemId });
          item.item.itemId = itemData;
        }
      }

      return handleResponse(
        200,
        "Inventory without varient fetched successfully.",
        allInventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  //get inventory without varient by Id
  static GetInventoryWithoutVarientID = async (req, resp) => {
    try {
      const { id } = req.params;

      const inventory = await InvertoryWithoutVarient.findOne({ id });

      if (!inventory) {
        return handleResponse(
          200,
          "No inventory without varient available.",
          {},
          resp
        );
      }

      if (inventory.created_by) {
        const CreatedBy = await User.findOne({ id: inventory.created_by });
        inventory.created_by = CreatedBy;
      }
      if (inventory.item.itemType === "Product" && inventory.item.itemId) {
        const itemData = await Product.findOne({ id: inventory.item.itemId });
        inventory.item.itemId = itemData;
      }
      if (inventory.item.itemType === "Medicine" && inventory.item.itemId) {
        const itemData = await Medicine.findOne({ id: inventory.item.itemId });
        inventory.item.itemId = itemData;
      }

      return handleResponse(
        200,
        "Inventory without varient fetched successfully.",
        inventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //update inventory without varient
  static UpdateInventoryWithoutVarient = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const { id } = req.params;
      const inventorybody = req.body;

      const inventory = await InvertoryWithoutVarient.findOne({ id });
      if (!inventory) {
        return handleResponse(404, "Inventory not found", {}, resp);
      }

      if (inventorybody.sku && inventorybody.sku !== inventory.sku) {
        const existingInventory = await InvertoryWithoutVarient.findOne({
          sku: inventorybody.sku,
          id: { $ne: id },
        });

        if (existingInventory) {
          return handleResponse(
            400,
            "Inventory with this SKU already exists.",
            {},
            resp
          );
        }
      }

      // Update the inventory fields
      for (const key in inventorybody) {
        if (Object.hasOwnProperty.call(inventorybody, key)) {
          inventory[key] = inventorybody[key];
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

  // soft-delete inventory
  static SoftDeleteInventoryWithoutVarient = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const inventory = await InvertoryWithoutVarient.findOne({ id });

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

      const trashInventory = await InvertoryWithoutVarient.findOneAndUpdate(
        { id },
        { $set: { deleted_at: new Date() } }
      );
      await trashInventory.save();
      return handleResponse(
        200,
        "Inventory added to trash successfully.",
        trashInventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  // reastore inventory
  static RestoreInventoryWithoutVarient = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const inventory = await InvertoryWithoutVarient.findOne({ id });

      if (!inventory) {
        return handleResponse(404, "Inventory not found", {}, resp);
      }

      if (inventory.deleted_at === null) {
        return handleResponse(400, "Inventory already restored.", {}, resp);
      }

      const trashInventory = await InvertoryWithoutVarient.findOneAndUpdate(
        { id },
        { $set: { deleted_at: null } }
      );
      await trashInventory.save();
      return handleResponse(
        200,
        "Inventory restored successfully.",
        trashInventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //get trash inventory without varient
  static GetTrashInventoryWithoutVarient = async (req, resp) => {
    try {
      const inventory = await InvertoryWithoutVarient.find().sort({
        createdAt: -1,
      });

      const allInventory = inventory.filter(
        (inventory) => inventory.deleted_at !== null
      );

      for (const item of allInventory) {
        if (item.created_by) {
          const CreatedBy = await User.findOne({ id: item.created_by });
          item.created_by = CreatedBy;
        }
        if (item.item.itemType === "Product" && item.item.itemId) {
          const itemData = await Product.findOne({ id: item.item.itemId });
          item.item.itemId = itemData;
        }
        if (item.item.itemType === "Medicine" && item.item.itemId) {
          const itemData = await Medicine.findOne({ id: item.item.itemId });
          item.item.itemId = itemData;
        }
      }

      if (allInventory.length == 0) {
        return handleResponse(
          200,
          "No inventory without varient available in trash.",
          {},
          resp
        );
      }
      return handleResponse(
        200,
        "Inventory without varient in trash fetched successfully.",
        allInventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, res);
    }
  };

  // delete inventory without varient
  static DeleteInventoryWithoutVarient = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }
      const { id } = req.params;
      const check = await InvertoryWithoutVarient.findOne({ id });
      if (!check) {
        return handleResponse(404, "Inventory not found", {}, resp);
      }
      if (check.deleted_at === null) {
        return handleResponse(
          400,
          "Add inventory to trash to delete it..",
          {},
          resp
        );
      }
      const inventory = await InvertoryWithoutVarient.findOneAndDelete({
        id,
      });
      if (!inventory) {
        return handleResponse(404, "Inventory not found", {}, resp);
      }
      return handleResponse(200, "Inventory deleted successfully.", {}, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  //import inventory without varients
  static ImportInventory = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const csvFile = req.files && req.files.csvFile && req.files.csvFile[0];
      if (!csvFile) {
        return handleResponse(400, "No file uploaded", {}, resp);
      }

      const filePath = csvFile.path;

      if (!fs.existsSync(filePath)) {
        return handleResponse(400, "File does not exist", {}, resp);
      }

      const inventoryData = [];
      const csvData = await csvtojson().fromFile(filePath);

      for (const item of csvData) {
        const productInfo = item.Product.split(",");
        const modelType = productInfo[0];
        const modelId = productInfo[1];

        if (modelType === "Product") {
          const item = await Product.findOne({ id: modelId });
          if (!item) {
            return handleResponse(404, "Product not found", {}, resp);
          }

          if (item.has_variant === true) {
            return handleResponse(
              400,
              "This Product Must Have Varient",
              {},
              resp
            );
          }
        }
        if (modelType === "Medicine") {
          const item = await Product.findOne({ id: modelId });
          if (!item) {
            return handleResponse(404, "Medicine not found", {}, resp);
          }

          if (item.has_variant === true) {
            return handleResponse(
              400,
              "This Medicine Must Have Varient",
              {},
              resp
            );
          }
        }

        const customId = await getNextSequenceValue("InvertoryWithoutVarient");

        const existingInventory = await InventoryWithVarient.findOne({
          sku: item.SKU,
        });
        const existingWithoutInventory = await InvertoryWithoutVarient.findOne({
          sku: item.SKU,
        });

        if (existingInventory || existingWithoutInventory) {
          return handleResponse(
            409,
            `Inventory with SKU ${item.SKU} already exists, skipping...`,
            {},
            resp
          );
        }

        inventoryData.push({
          item: { itemType: modelType, itemId: modelId },
          sku: item.SKU,
          stock_quantity: item.StockQuantity,
          mrp: item.MRP,
          selling_price: item.SellingPrice,
          discount_percent: item.DiscountPercent,
          created_by: user.id,
          id: customId,
        });
      }
      await InvertoryWithoutVarient.insertMany(inventoryData);

      return handleResponse(
        201,
        "Products imported successfully",
        { data: inventoryData },
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

  //export inventory without varients
  static ExportInventory = async (req, resp) => {
    try {
      const inventory = await InvertoryWithoutVarient.find();

      if (inventory.length === 0) {
        return handleResponse(200, "No inventory available", {}, resp);
      }

      const csvStream = format({
        headers: [
          "Product",
          "SKU",
          "Stock Quantity",
          "MRP",
          "Selling Price",
          "Discount Percent",
          "ID",
          "Updated At",
          "Created At",
          "Deleted At",
          "Created By",
        ],
      });

      const writableStream = fs.createWriteStream(
        "InventoryWithoutVariant.csv"
      );
      writableStream.on("finish", () => {
        resp.download(
          "InventoryWithoutVariant.csv",
          "InventoryWithoutVariant.csv",
          (err) => {
            if (err) {
              return handleResponse(
                400,
                "Error downloading Product.csv",
                {},
                resp
              );
            }
          }
        );
      });

      csvStream.pipe(writableStream);

      inventory.forEach((inventory) => {
        csvStream.write({
          Product: `${inventory.item.ItemType},${inventory.item.ItemId}`,
          SKU: inventory.sku,
          "Stock Quantity": inventory.stock_quantity,
          MRP: inventory.mrp,
          "Selling Price": inventory.selling_price,
          "Discount Percent": inventory.discount_percent,
          ID: inventory.id,
          "Updated At": moment(inventory.updatedAt).format("YYYY-MM-DD"),
          "Created At": moment(inventory.createdAt).format("YYYY-MM-DD"),
          "Deleted At": inventory.deleted_at
            ? moment(inventory.deleted_at).format("YYYY-MM-DD")
            : "null",
          "Created By": inventory.created_by,
        });
      });

      csvStream.end();
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
}

export default InvertoryWithoutVarientController;
