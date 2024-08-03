import handleResponse from "../../config/http-response.js";
import Cart from "../../src/models/adminModel/CartModel.js";
import CartItem from "../../src/models/adminModel/CartItemModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";
import Sergical_Equipment from "../../src/models/adminModel/SergicalEquipmentModedl.js";
import validateFields from "../../config/validateFields.js";
import Medicine from "../../src/models/adminModel/MedicineModel.js";
import UserAddress from "../../src/models/adminModel/UserAddressModel.js";
import Country from "../../src/models/adminModel/CountryModel.js";
import ShippingCountry from "../../src/models/adminModel/ShippingCountryModel.js";
import ShippingZone from "../../src/models/adminModel/ShippingZoneModel.js";
import ShippingRate from "../../src/models/adminModel/ShippingRateModel.js";
import Order from "../../src/models/adminModel/OrderModel.js";
import Coupons from "../../src/models/adminModel/CouponsModel.js";
import OrderItem from "../../src/models/adminModel/OrderItemModel.js";
import User from "../../src/models/adminModel/AdminModel.js";
import moment from "moment";
import CancelOrderReq from "../../src/models/adminModel/CancelRequestModel.js";
import MyPrescription from "../../src/models/adminModel/MyPrescriptionModel.js";
import NeedHelp from "../../src/models/adminModel/NeedHelp.js";
import NeedHelpMessage from "../../src/models/adminModel/NeedHelpMessageModel.js";


const generateSequentialOrderId = () => {
  orderCounter += 1;
  return String(orderCounter).padStart(6, "0");
};

class OrderController {
  static Checkout = async (req, res) => {
    try {
      const {
        shipping_id,
        payment_method,
        amount,
        transaction_id,
        payment_status,
        shipping_rate_id,
        coupon_discount,
        prescription,
        prescription_id
      } = req.body;

      const requiredFields = [
        { field: "shipping_id", value: shipping_id },
        { field: "payment_method", value: payment_method },
        { field: "amount", value: amount },
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

      // Check for existing transaction ID
      const transactionExists = await Order.exists({ transaction_id });
      if (transactionExists) {
        return handleResponse(400, "Invalid Transaction Id", {}, res);
      }

      const userId = req.user.id;


      // Create orders
      const carts = await Cart.find({ user_id: userId });
      let orderCount = await Order.find();

      if (carts.length > 0) {
        let cartId = 0;
        let order = null;
        let shipping_charges = await ShippingRate.findOne({ id: shipping_rate_id }).select("id delivery_takes rate name");


        for (const cart of carts) {
          const coupon = await Coupons.findOne({
            code: cart.coupon_code,
            status: true,
          });
          if (coupon) {
            coupon.remaining_coupon -= 1;
            await coupon.save();
          }

          cartId++;

          order = new Order({
            user_id: userId,
            order_number: Math.floor(Math.random() * 999999) + 1,
            shipping_rate_id: shipping_rate_id,
            item_count: cart.item_count,
            invoice_number: String(orderCount.length).padStart(cartId, "0"),
            coupon_code: cart.coupon_code,
            sub_total: cart.sub_total,
            discount_amount: cart.discount_amount,
            coupon_discount: coupon_discount,
            tax_amount: cart.tax_amount,
            shipping_id: shipping_id,
            shipping_amount: shipping_charges.rate,
            total_amount: amount,
            status: "pending",
            refund_amount: amount,
            payment_method: payment_method,
            transaction_id: transaction_id,
            remarks: req.body.remarks,
            payment_status: payment_status,
            prescription: prescription,
            paid_at: new Date(),
          });
          await order.save();

          const cartItems = await CartItem.find({ cart_id: cart.id });
          for (const item of cartItems) {
            const orderItem = new OrderItem({
              order_id: order.id,
              product_id: item.product_id,
              variant_id: item.variant_id,
              quantity: item.quantity,
              type: item.type,
              name: item.name,
              weight: item.weight,
              total_weight: item.total_weight,
              single_mrp: item.single_mrp,
              purchase_price: item.purchase_price,
              selling_price: item.selling_price,
              discount_percent: item.discount_percent,
              total: item.total,
              refund_amount: item.total,
              user_id: item.user_id,
            });
            await orderItem.save();

            // Update stock quantity
            if (item.variant_id) {
              const inventory = await InventoryWithVarient.findOne({
                id: item.variant_id,
              });
              if (inventory) {
                inventory.stock_quantity -= item.quantity;
                await inventory.save();
              }
            } else {
              const inventoryWithoutVariants = await InvertoryWithoutVarient.findOne({

                itemId: item.product_id,
                itemType: item.type,
              });

              if (inventoryWithoutVariants) {
                inventoryWithoutVariants.stock_quantity -= item.quantity;
                await inventoryWithoutVariants.save();
              }

            }
          }
        }

        // Remove cart items
        await Cart.deleteMany({ user_id: userId });
        await CartItem.deleteMany({ user_id: userId });

        const shippingAddress = await UserAddress.findOne({ id: shipping_id });
        const customer = {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone_number,
        };

        // update Prescription 
        const myPrescription = await MyPrescription.findOne({
          id: prescription_id
        });

        if (myPrescription) {
          myPrescription.order_id = order.id;
          await myPrescription.save();
        }


        return handleResponse(
          200,
          "Order placed successfully",
          {
            customer_name: customer,
            Address_detail: shippingAddress,
            transaction_id: transaction_id,
            order_id: order.order_number,
            shipping_charges: shipping_charges
          },
          res
        );
      } else {
        return handleResponse(404, "Cart item not found", {}, res);
      }
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };


  static MyOrders = async (req, res) => {
    try {
      const { status } = req.query;

      // Construct the filter object
      let filter = { user_id: req.user.id };
      const customerData = await User.findOne({ id: req.user.id },
        "id name phone_number email"
      )

      // Add status to the filter if it's not "All"
      if (status && status !== "all") {
        filter.status = status;
      }
      const orders = await Order.find(filter).lean().sort({ _id: -1 });

      for (const order of orders) {
        const OrderItems = await OrderItem.find({ order_id: order.id }).lean();
        const customerData = await User.findOne({ id: order.user_id },
          "id name phone_number email"
        )
        order.Order_items = OrderItems;
        order.customer = customerData;
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
      }
      orders.customer = customerData

      return handleResponse(200, "Data fetched", orders, res);
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

  static CancelOrderReq = async (req, res) => {
    try {
      const { order_id, product_id, reason, description } = req.body;
      const requiredFields = [
        { field: "order_id", value: order_id },
        { field: "product_id", value: product_id },
        { field: "reason", value: reason },
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

      const cancel = new CancelOrderReq({
        order_id: order_id,
        product_id: product_id,
        order_status: "Waiting For Payment",
        created_by: req.user.id,
        reason: reason,
        description: description,
      });

      await cancel.save();

      if (cancel) {
        handleResponse(200, "Request sent successfully", {}, res);
      } else {
        handleResponse(200, "Request sent successfully", {}, res);
      }
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };


  //--------------------------need help------------------------
  static CreateDispute = async (req, resp) => {
    try {
      const user = req.user;

      if (!user) {
        return handleResponse(401, "Unauthorized user", {}, resp);
      }

      const disputeData = req.body;
      const files = req.files;

      const orderData = await Order.findOne({ order_number: req.body.orderId });

      if (!orderData) {
        return handleResponse(404, "Order not found", {}, resp);
      }

      if (orderData.user_id !== user.id) {
        return handleResponse(400, "User did not match, Unable to create dispute.", {}, resp);
      }

      const existingDispute = await NeedHelp.findOne({ orderId: disputeData.orderId });
      if (existingDispute) {
        return handleResponse(409, "Dispute already exists.", {}, resp);
      }

      const newDispute = new NeedHelp({
        ...disputeData,
        created_by: user.id,
      });

      const base_url = `${req.protocol}://${req.get("host")}`;

      if (files && files.files && files.files.length > 0) {
        console.log("File path:", files.files[0].path);
        newDispute.files = `${base_url}/${files.files[0].path.replace(/\\/g, "/")}`;
      }

      await newDispute.save();
      return handleResponse(200, "Dispute Created Successfully", newDispute, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  };

  static GetUserDisputes = async (req, resp) => {
    try {
      const user = req.user;
      const { id } = req.params;
      if (!user) {
        return handleResponse(401, "unauthorized user.", {}, resp)
      }

      const dispute = await NeedHelp.findOne({ id: id, created_by: user.id })

      if (!dispute) {
        return handleResponse(200, "No Dispute found.", {}, resp)
      }

      return handleResponse(200, "Dispute fetched successfully.", dispute, resp)
    } catch (err) {
      return handleResponse(500, err.message, {}, resp)
    }
  }

  static sendMessage = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "Unauthorized User.", {}, resp)
      }
      const messageData = req.body;


      const disputeData = await NeedHelp.findOne({ orderId: messageData.orderId })
      if (disputeData.status === "closed") {
        return handleResponse(400, "Dispute is already closed.", {}, resp)
      }

      if (!messageData.message) {
        return handleResponse(400, "Message Field is required.", {}, resp)
      }

      const newMessage = new NeedHelpMessage({
        ...messageData,
        created_by: user.id,
        userType: "consumer"
      })

      await newMessage.save()
      return handleResponse(200, "Message Send Successfully.", newMessage, resp)
    } catch (err) {
      return handleResponse(500, err.message, {}, resp)
    }
  }

  static GetAllMessages = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "Unauthorized User", {}, resp);
      }

      const { id } = req.params;

      const dispute = await NeedHelp.findOne({ id: id });
      if (!dispute) {
        return handleResponse(404, "Dispute not found.", {}, resp);
      }

      const AllMessages = [];

      if (dispute.orderId && dispute.id) {
        const messageData = await NeedHelpMessage.find({ orderId: dispute.orderId, disputeId: dispute.id });
        AllMessages.push(...messageData);
      }

      const AllOrderItems = [];

      const orderDetail = await Order.findOne({ order_number: dispute.orderId });
      if (orderDetail) {
        const orderItem = await OrderItem.find({ order_id: orderDetail.id });
        AllOrderItems.push(...orderItem);
        orderDetail.items = AllOrderItems;
      }

      if (AllMessages.length > 1 && dispute.status === "open") {
        dispute.status = "pending";
        await dispute.save();
      }

      const disputeData = dispute.toObject();
      disputeData.disputeMessage = AllMessages;
      disputeData.orderData = orderDetail;

      if (dispute && dispute.created_by) {
        const customerData = await User.findOne({ id: dispute.created_by },
          "id name email phone"
        );
        if (customerData) {
          disputeData.created_by = customerData;
        }
      }

      return handleResponse(200, "Data fetched successfully.", disputeData, resp);
    } catch (err) {
      console.log("err", err);
      return handleResponse(500, err.message, {}, resp);
    }
  }


  static updateStatus = async (req, resp) => {
    try {
      const user = req.user;
      if (!user) {
        return handleResponse(401, "Unauthorized User", {}, resp);
      }

      const { id } = req.params;
      const status = req.body;

      const dispute = await NeedHelp.findOneAndUpdate(
        { id: id },
        { $set: status },
        { new: true }
      );

      if (!dispute) {
        return handleResponse(404, "Dispute Not Found.", {}, resp);
      }

      return handleResponse(200, "Dispute Status Changed Successfully", dispute, resp);
    } catch (err) {
      return handleResponse(500, err.message, {}, resp);
    }
  }

}

export default OrderController;
