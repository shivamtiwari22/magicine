import handleResponse from "../../config/http-response.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import validateFields from "../../config/validateFields.js";
import moment from "moment";
import fs from "fs";
import { format } from "@fast-csv/format";
import path from "path";
import Order from "../../src/models/adminModel/OrderModel.js";
import OrderItem from "../../src/models/adminModel/OrderItemModel.js";
import UserAddress from "../../src/models/adminModel/UserAddressModel.js";

class OrderController {
  static AllOrder = async (req, res) => {
    try {
      const { status, prescription, currency, fromDate, toDate, search } =
        req.query;

      let filter = {};

      // Add filters based on query parameters
      if (status) {
        filter.status = status;
      }
      if (prescription) {
        filter.prescription = prescription;
      }
      if (currency) {
        filter.currency = currency;
      }

      // const searchableFields = ['name' ,'prescription', 'currency', 'status','payment_status','transaction_id']; // Add all the fields you want to search
      // const searchString = String(search); // Ensure search term is treated as a string
      // if (searchString) {
      //   filter.$or = searchableFields.map(field => ({
      //     [field]: { $regex: searchString, $options: 'i' }
      //   }));
      // }

      // Create filter object
      const orders = await Order.find(filter).lean().sort({ _id: -1 });

      for (const order of orders) {
        const OrderItems = await OrderItem.find({ order_id: order.id }).lean();
        const user = await User.findOne(
          { id: order.user_id },
          "id name phone_number"
        );
        order.user = user;

        order.order_date = moment(order.createdAt).format("DD-MM-YYYY");
      }

      const filteredOrder = orders.filter((user) => {
        let matches = true;
        if (fromDate && toDate) {
          const createdAt = moment(user.createdAt, "YYYY-MM-DD");
          const from = moment(fromDate, "YYYY-MM-DD").startOf("day");
          const to = moment(toDate, "YYYY-MM-DD").endOf("day");
          matches = matches && createdAt.isBetween(from, to, null, "[]");
        }

        return matches;
      });

      return handleResponse(200, "Data fetched", filteredOrder, res);
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };

  static OrderDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findOne({ id: id }).lean();
      if (!order) {
        return handleResponse(404, "order not found", {}, res);
      }

      const OrderItems = await OrderItem.find({ order_id: order.id }).lean();
      const user = await User.findOne(
        { id: order.user_id },
        "id name phone_number"
      );
      order.user = user;
      order.orderItems = OrderItems;
      order.order_date = moment(order.createdAt).format("DD-MM-YYYY");

      for (const item of OrderItems) {
        let product;
        if (item.type == "Product") {
          product = await Product.findOne(
            { id: item.product_id },
            "id product_name slug featured_image has_variant packOf form type"
          ).lean();
        } else if (item.type == "Medicine") {
          product = await Medicine.findOne(
            { id: item.product_id },
            "id product_name slug featured_image has_variant packOf form prescription_required type indication "
          ).lean();
        } else {
          product = await Sergical_Equipment.findOne(
            { id: item.product_id },
            "id product_name slug featured_image type"
          ).lean();
        }
        item.product = product;
      }

      const address = await UserAddress.findOne({
        id: order.shipping_id,
      }).lean();
      order.shipping_address = address;

      return handleResponse(200, "fetch successfully", order, res);
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };

  static UpdateOrderStatus = async (req, res) => {
    try {
      const { id, status } = req.query;

      const requiredFields = [
        { field: "id", value: id },
        { field: "status", value: status },
      ];
      const validationErrors = validateFields(requiredFields);

      if (validationErrors.length > 0) {
        return handleResponse(
          400,
          "Validation error",
          { errors: validationErrors },
          res
        );
      }

  
      
      const updatedOrder = await Order.findOne({ id: id });
       updatedOrder.status = status ;
       updatedOrder.save();


      if (updatedOrder ) {
        // If the order was successfully updated, fetch the updated order
        const updatedOrder = await Order.findOne({ id: id }).lean();

        return handleResponse(
          200,
          "Order status updated successfully",
          updatedOrder,
          res
        );
      } else {
        return handleResponse(
          404,
          "Order not found or status unchanged",
          {},
          res
        );
      }
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };

  // static exportCart = async (req, res) => {
  //   try {

  //       const carts = await Cart.find().lean().sort({id:-1}); // Fetch all users from the database

  //       if (!carts || carts === 0) {
  //           handleResponse(404,"No Cart found",{},res)
  //       }

  //       for (const cart of carts) {
  //           let cartItems = await CartItem.find({ cart_id: cart.id }).lean();
  //           let user = await User.findOne(
  //             { id: cart.user_id },
  //             "id name email createdAt"
  //           ).lean();
  //           cart.user = user;
  //           cart.cart_items = cartItems;
  //           cart.created_at = moment(cart.createdAt).format("DD-MM-YYYY");

  //             let total_quantity = 0 ;
  //             for(const item of cartItems ){
  //                    total_quantity += item.quantity
  //             }

  //             cart.total_quantity = total_quantity;
  //         }

  //       const csvStream = format({
  //         headers: [
  //           "Customer Name",
  //           "Created On",
  //           "Items",
  //           "Quantity",
  //           "Grand Total",
  //         ],
  //       });
  //       const writableStream = fs.createWriteStream("cart.csv");

  //       writableStream.on("finish", () => {
  //         res.download("cart.csv", "cart.csv", (err) => {
  //           if (err) {
  //             console.error("Error downloading file:", err);
  //             handleResponse(500, err, {}, res);
  //           }
  //         });
  //       });

  //       csvStream.pipe(writableStream);

  //       carts.forEach((cart) => {
  //         csvStream.write({
  //           "Customer Name": cart.user.name,
  //           "Created On": cart.created_at,
  //           "Items": cart.item_count,
  //           "Quantity": cart.total_quantity,
  //           "Grand Total": cart.total_amount
  //         });
  //       });

  //       csvStream.end()

  //   } catch (e) {
  //     return handleResponse(500, e.message, {}, res);
  //   }
  // };
}

export default OrderController;
