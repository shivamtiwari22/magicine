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

class OrderController {
  static Checkout = async (req, res) => {
    try {
      const {
        shipping_id,
        payment_method,
        amount,
        transaction_id,
        payment_status,
        prescription
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

          const order = new Order({
            user_id: userId,
            order_number: Math.floor(Math.random() * 999999) + 1,
            shipping_rate_id: req.body.shipping_rate_id,
            item_count: cart.item_count,
            invoice_number: String(orderCount.length).padStart(cartId, "0"),
            coupon_code: cart.coupon_code,
            sub_total: cart.sub_total,
            discount_amount: cart.discount_amount,
            coupon_discount: cart.coupon_discount,
            tax_amount: cart.tax_amount,
            shipping_id: cart.shipping_id,
            shipping_amount: cart.shipping_amount,
            total_amount: cart.total_amount,
            status: "pending",
            refund_amount: cart.total_amount,
            payment_method: payment_method,
            transaction_id: transaction_id,
            remarks: req.body.remarks,
            payment_status: payment_status,
            prescription : prescription,
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
              const inventoryWithoutVariants = InvertoryWithoutVarient.findOne({
                "item.itemId": item.product_id,
                "item.itemType": item.type,
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

        return handleResponse(
          200,
          "Order placed successfully",
          {
            customer_name: customer,
            Address_detail: shippingAddress,
            transaction_id: transaction_id,
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
      const orders = await Order.find({ user_id: req.user.id })
        .lean()
        .sort({ _id: -1 });

      for (const order of orders) {
        const OrderItems = await OrderItem.find({ order_id: order.id }).lean();
        order.Order_items = OrderItems;
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

      return handleResponse(200, "Data fetched", orders,res);
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };
}

export default OrderController;
