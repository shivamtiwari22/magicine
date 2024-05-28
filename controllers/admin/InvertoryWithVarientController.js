import InvertoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import handleResponse from "../../config/http-response.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import Varient from "../../src/models/adminModel/InventoryVarientsModel.js";

class InventoryWithVarientController {
  // ---------------------------------------------------add product to inventory------------------------------------------------
  //add inventory with varient
  static AddInventoryWithVarient = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "User not found", {}, resp);
      }

      const inventoryBody = req.body;

      if (
        !inventoryBody.item ||
        !inventoryBody.item.itemType ||
        !inventoryBody.item.itemId
      ) {
        return handleResponse(
          400,
          "Item type and item ID are required.",
          {},
          resp
        );
      }
      let itemExists = false;

      const Id = inventoryBody.item.itemId;
      if (inventoryBody.item.itemType === "Product") {
        itemExists = await findOne({ id: Id });
        if (itemExists.has_variant === false) {
          return handleResponse(
            400,
            "Product with this ID must not have varients.",
            {},
            resp
          );
        }
      } else if (inventoryBody.item.itemType === "Medicine") {
        itemExists = await Medicine.findOne({ id: Id });
        if (itemExists.has_variant === false) {
          return handleResponse(
            400,
            "Medicine with this ID must not have varients.",
            {},
            resp
          );
        }
      }

      if (!itemExists) {
        return handleResponse(200, "Referenced item does not exist.", {}, resp);
      }

      const newInventory = new InvertoryWithVarient({
        ...inventoryBody,
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

  //get inventory with varient
  static GetInventoryWithVarient = async (req, resp) => {
    try {
      const inventory = await InvertoryWithVarient.find().sort({
        createdAt: -1,
      });

      const getInventory = await inventory.filter(
        (inventory) => inventory.deleted_at === null
      );

      if (getInventory.length > 1) {
        return handleResponse(
          200,
          "No item available in inventory with varient",
          {},
          resp
        );
      }

      for (const item of getInventory) {
        if (item.created_by) {
          const createdBy = await User.findOne({ id: item.created_by });
          item.created_by = createdBy;
        }

        if (item.item.itemType === "Product") {
          const product = await findOne({ id: item.item.itemId });
          item.item.itemId = product;
        } else if (item.item.itemType === "Medicine") {
          const medicine = await Medicine.findOne({ id: item.item.itemId });
          item.item.item.itemId = medicine;
        }
      }

      return handleResponse(
        200,
        "Inventory fetched successfully.",
        getInventory,
        resp
      );
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };
  //  add varients to added product

  //add varients to product
  // static AddVarientsToProduct = async (req, resp) => {
  //   try {
  //     const user = req.user;
  //     if (!user) {
  //       console.error("User not found");
  //       return handleResponse(401, "User not found", {}, resp);
  //     }

  //     const { data, ...inventoryData } = req.body;

  //     let images = [];

  //     // Iterate over each object in the data array
  //     data.forEach((variant) => {
  //       // Check if the object has an 'image' property
  //       if (variant.hasOwnProperty("image")) {
  //         // If yes, push the value of the 'image' property into the images array
  //         images.push(variant.image);
  //       }
  //     });

  //     // Handle uploaded files (if any) and push their paths into the images array
  //     // if (req.files) {
  //     //     req.files.forEach((file) => {
  //     //         images.push(file.path);
  //     //     });
  //     // }

  //     console.log("Uploaded images:", images);

  //     // Check existing inventory variants
  //     const existingInventoryVariant = await InvertoryWithVarient.findOne({
  //       id: inventoryData.itemId,
  //     });
  //     const existingInventoryWithoutVariant =
  //       await InvertoryWithoutVarient.findOne({
  //         id: inventoryData.itemId,
  //       });

  //     // If variant already exists in inventory, return error response
  //     if (existingInventoryVariant || existingInventoryWithoutVariant) {
  //       return handleResponse(400, "Already added to inventory.", {}, resp);
  //     }

  //     // Check if the item type is Product or Medicine and handle accordingly
  //     if (inventoryData.itemType === "Product") {
  //       const existingProduct = await Product.findOne({
  //         id: inventoryData.itemId,
  //       });
  //       if (existingProduct.has_variant === false) {
  //         return handleResponse(
  //           400,
  //           "Product with this ID must not have variants.",
  //           {},
  //           resp
  //         );
  //       }
  //     } else if (inventoryData.itemType === "Medicine") {
  //       const existingMedicine = await Medicine.findOne({
  //         id: inventoryData.itemId,
  //       });
  //       if (existingMedicine.has_variant === false) {
  //         return handleResponse(
  //           400,
  //           "Medicine with this ID must not have variants.",
  //           {},
  //           resp
  //         );
  //       }
  //     }

  //     // If all checks pass, return success response
  //     return handleResponse(201, "Variants added successfully.", {}, resp);
  //   } catch (err) {
  //     console.error(err);
  //     return handleResponse(500, err.message, {}, resp);
  //   }
  // };
}

export default InventoryWithVarientController;
