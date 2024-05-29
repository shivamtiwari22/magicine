import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import handleResponse from "../../config/http-response.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import { all } from "axios";

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

      const [products, medicines] = await Promise.all([
        Product.find(baseQuery),
        Medicine.find(baseQuery),
      ]);
      if (products.length < 1 && medicines.length < 1) {
        return handleResponse(200, "No data available", {}, resp);
      }

      const combinedResults = [...products, ...medicines];

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

      const Id = inventoryWithoutVarientData.item.itemId;
      let itemExists = false;
      if (inventoryWithoutVarientData.item.itemType === "Product") {
        itemExists = await Product.findOne({ id: Id });
        if (!itemExists) {
          return handleResponse(
            200,
            "Referenced item does not exist.",
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
      } else if (inventoryWithoutVarientData.item.itemType === "Medicine") {
        itemExists = await Medicine.findOne({ id: Id });
        if (!itemExists) {
          return handleResponse(
            200,
            "Referenced item does not exist.",
            {},
            resp
          );
        }
        if (itemExists.has_varient === true) {
          return handleResponse(
            400,
            "Medicine with this ID must have variants.",
            {},
            resp
          );
        }
      }

      if (!itemExists) {
        return handleResponse(200, "Referenced item does not exist.", {}, resp);
      }

      const existingInventory = await InvertoryWithoutVarient.findOne({
        sku: inventoryWithoutVarientData.sku,
      });
      if (existingInventory) {
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
}

export default InvertoryWithoutVarientController;
