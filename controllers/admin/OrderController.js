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
import CancelOrderReq from "../../src/models/adminModel/CancelRequestModel.js";

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
        order.user.created_at = moment(order.user.createdAt).format("DD-MM-YYYY");

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
      updatedOrder.status = status;
      updatedOrder.save();

      if (updatedOrder) {
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

  static OrderCsv = async (req, res) => {
    try {
      const carts = await Order.find().lean().sort({ id: -1 }); // Fetch all order from the database

      if (!carts || carts === 0) {
        handleResponse(404, "No Order found", {}, res);
      }

      for (const order of carts) {
        const OrderItems = await OrderItem.find({ order_id: order.id }).lean();
        const user = await User.findOne(
          { id: order.user_id },
          "id name phone_number"
        );
        order.user = user;

        order.order_date = moment(order.createdAt).format("DD-MM-YYYY");
      }

      const csvStream = format({
        headers: [
          "Order Id",
          "Order Date",
          "Customer Name",
          "Prescription",
          "Total",
          "Payment",
          "Transaction Id",
          "status",
        ],
      });
      const writableStream = fs.createWriteStream("orders.csv");

      writableStream.on("finish", () => {
        res.download("orders.csv", "orders.csv", (err) => {
          if (err) {
            console.error("Error downloading file:", err);
            handleResponse(500, err, {}, res);
          }
        });
      });

      csvStream.pipe(writableStream);

      carts.forEach((cart) => {
        csvStream.write({
          "Order Id": cart.order_number,
          "Order Date": cart.order_date,
          "Customer Name": cart.user.name,
          Prescription: cart.prescription ?? null,
          Total: cart.total_amount,
          Payment: cart.payment_status,
          "Transaction Id": cart.transaction_id,
          status: cart.status,
        });
      });

      csvStream.end();
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };

  static CancelRequest = async (req, res) => {
    try {

      const cancelation = await CancelOrderReq.find().lean();

      for(const item of cancelation){
            const user = await User.findOne({id:item.created_by},'id name email');
            const order = await Order.findOne({id:item.order_id},'id order_number refund_amount');
            item.user = user ;
            item.order = order ;
      }

      return handleResponse(200, "data fetched", cancelation, res);
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };
}

export default OrderController;
