import handleResponse from "../../config/http-response.js";
import Cart from "../../src/models/adminModel/CartModel.js";
import CartItem from "../../src/models/adminModel/CartItemModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import moment from "moment";
import fs from "fs";
import { format } from "@fast-csv/format";
import path from "path";


class CartController {
  static AllCart = async (req, res) => {
    try {
      const { username, grandtotal, fromDate, toDate } = req.query;

      const filter = { user_id: { $ne: null } };

      if (username) {
        const users = await User.find({
          name: { $regex: username, $options: "i" },
        }).lean();
        const userIds = users.map((user) => user.id);
        filter.user_id = { $in: userIds };
      }

      if (grandtotal) {
        filter.total_amount = { $gte: parseFloat(grandtotal) };
      }

      const carts = await Cart.find(filter).lean().sort({ _id: -1 });

      for (const cart of carts) {
        let cartItems = await CartItem.find({ cart_id: cart.id }).lean();
        let user = await User.findOne(
          { id: cart.user_id },
          "id name email createdAt"
        ).lean();
        cart.user = user;
        cart.user.created_at  = moment(cart.user.createdAt).format("DD-MM-YYYY");
        cart.cart_items = cartItems;
        cart.created_at = moment(cart.createdAt).format("DD-MM-YYYY");    

        let totalQuantity = 0;

        for (const item of cartItems) {
          totalQuantity += item.quantity;

          let product;
          if (item.type == "Product") {
            product = await Product.findOne(
              { id: item.product_id },
              "id product_name slug featured_image has_variant packOf form type"
            ).lean();
          } else if (item.type == "Medicine") {
            product = await Medicine.findOne(
              { id: item.product_id },
              "id product_name slug featured_image has_variant packOf form prescription_required type indication"
            ).lean();
          } else {
            product = await Sergical_Equipment.findOne(
              { id: item.product_id },
              "id product_name slug featured_image type"
            ).lean();
          }

          item.product = product;
        }

        cart.total_quantity = totalQuantity;
      }

      const filteredCart = carts.filter((user) => {
        let matches = true;
        if (fromDate && toDate) {
          const createdAt = moment(user.createdAt, "YYYY-MM-DD");
          const from = moment(fromDate, "YYYY-MM-DD").startOf("day");
          const to = moment(toDate, "YYYY-MM-DD").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      return handleResponse(200, "Data fetched", filteredCart, res);
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };


  static exportCart = async (req, res) => {
    try {

      const carts = await Cart.find().lean().sort({ id: -1 });

      if (!carts || carts === 0) {
        handleResponse(404, "No Cart found", {}, res)
      }

      for (const cart of carts) {
        let cartItems = await CartItem.find({ cart_id: cart.id }).lean();
        let user = await User.findOne(
          { id: cart.user_id },
          "id name email createdAt"
        ).lean();
        cart.user = user;
        cart.cart_items = cartItems;
        cart.created_at = moment(cart.createdAt).format("DD-MM-YYYY");


        let total_quantity = 0;
        for (const item of cartItems) {
          total_quantity += item.quantity
        }

        cart.total_quantity = total_quantity;
      }

      const csvStream = format({
        headers: [
          "Customer Name",
          "Created On",
          "Items",
          "Quantity",
          "Grand Total",
        ],
      });
      const writableStream = fs.createWriteStream("cart.csv");

      writableStream.on("finish", () => {
        res.download("cart.csv", "cart.csv", (err) => {
          if (err) {
            console.error("Error downloading file:", err);
            handleResponse(500, err, {}, res);
          }
        });
      });

      csvStream.pipe(writableStream);

      carts.forEach((cart) => {
        csvStream.write({
          "Customer Name": cart.user.name,
          "Created On": cart.created_at,
          "Items": cart.item_count,
          "Quantity": cart.total_quantity,
          "Grand Total": cart.total_amount
        });
      });

      csvStream.end()

    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };
}

export default CartController;
