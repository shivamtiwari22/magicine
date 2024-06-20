import handleResponse from "../../config/http-response.js";
import Cart from "../../src/models/adminModel/CartModel.js";
import CartItem from "../../src/models/adminModel/CartItemModel.js";
import Product from "../../src/models/adminModel/GeneralProductModel.js";
import InventoryWithVarient from "../../src/models/adminModel/InventoryWithVarientModel.js";
import InvertoryWithoutVarient from "../../src/models/adminModel/InventoryWithoutVarientModel.js";

class CartController {
  static AddCart = async (req, res) => {
    try {
      const { product_id, quantity } = req.body;
      const requiredFields = [
        { field: "product_id", value: product_id },
        { field: "quantity", value: quantity },
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

      const user_id = req.user.id;

      const product = await Product.findOne({ where: { id: product_id } });

      if (!product) {
        return handleResponse(404, "Product not found", {}, res);
      }

      const cartExists = await CartItem.findOne({
        where: { user_id: user_id, product_id: product_id },
      });

      if (cartExists) {
        return handleResponse(409, "Item already added to cart", {}, res);
      }

      //   check if product has variant

      if (product.has_variant) {
        if (!req.body.variant_id) {
          return handleResponse(422, "variant_id is required", {}, res);
        }

        variant = await InventoryWithVarient.findOne({
          where: { id: req.body.variant_id, modelType: product.type },
        });
        variantStock = variant ? variant.stock_quantity : null;
      } else {
        const inventoryWithoutVariants = InvertoryWithoutVarient.findOne({
          where: { "item.itemId": product.id, "item.itemType": product.type },
        });
        if (inventoryWithoutVariants) {
          variant = inventoryWithoutVariants;
          variantStock = variant.stock_qty;
        }
      }

      if (variantStock < quantity) {
        return handleResponse(422, "Product is out of stock", {}, res);
      }

      let cart = await Cart.findOne({
        where: { user_id: user_id },
      });

      if (!cart) {
        cart = await Cart.create({
          user_id: user_id,
          sub_total: variant.mrp * quantity,
          item_count: 1,
          discount_amount:
            variant.mrp * quantity - variant.selling_price * quantity,
          total_amount: variant.selling_price * quantity,
        });
      }

      const cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: product_id,
        variant_id: product.has_variant ? req.body.variant_id : null,
        quantity: quantity,
        name: product.product_name,
        weight: product.weight,
        total_weight: quantity * product.weight,
        single_mrp: variant.mrp,
        purchase_price: variant.mrp * quantity,
        selling_price:
          variant.mrp * quantity - variant.selling_price * quantity,
        total: variant.selling_price * quantity,
        user_id: user_id,
        type: product.has_variant ? variant.modelType : variant.item.itemType,
        discount_percent: variant.discount_percent,
      });

      if (cart) {
        const vendorCartItems = await CartItem.findAll({
          where: { cart_id: cart.id },
        });
        cart.item_count = vendorCartItems.length;
        cart.sub_total = vendorCartItems.reduce(
          (acc, item) => acc + item.purchase_price,
          0
        );
        cart.discount_amount = vendorCartItems.reduce(
          (acc, item) => acc + item.selling_price,
          0
        );
        cart.total_amount = vendorCartItems.reduce(
          (acc, item) => acc + item.total,
          0
        );
        await cart.save();
      }

      return handleResponse(200, "Item added to cart successfully", {}, res);
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };
}

export default CartController;
