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

class CartController {
  static AddCart = async (req, res) => {
    try {
      const { product_id, quantity, type } = req.body;
      const requiredFields = [
        { field: "product_id", value: product_id },
        { field: "quantity", value: quantity },
        { field: "type", value: type },
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

      const user_id = req.user ?  req.user.id : null;


      let product = null;
      if (type == "Medicine") {
        product = await Medicine.findOne({ id: product_id });
      } else if (type == "Product") {
        product = await Product.findOne({ id: product_id });
      } else {
        product = await Sergical_Equipment.findOne({ id: product_id });
      }

      if (!product) {
        return handleResponse(404, "Product not found", {}, res);
      }

      let cartExists;
      if (user_id) {
        cartExists = await CartItem.findOne({
          user_id: user_id,
          product_id: product_id,
          type: type,
        });
      } else {
        cartExists = await CartItem.findOne({
          guest_user: req.device_id,
          product_id: product_id,
          type: type,
        });
      }

      if (cartExists) {
        return handleResponse(409, "Item already added to cart", {}, res);
      }

      //   check if product has variant
      let variant = null;
      let variantStock = null;

      if (product.has_variant) {
        if (!req.body.variant_id) {
          return handleResponse(422, "variant_id is required", {}, res);
        }

        variant = await InventoryWithVarient.findOne({
          id: req.body.variant_id,
          modelType: product.type,
        });
        variantStock = variant ? variant.stock_quantity : null;
      } else {
        const inventoryWithoutVariants = InvertoryWithoutVarient.findOne({
          "item.itemId": product.id,
          "item.itemType": product.type,
        });
        if (inventoryWithoutVariants) {
          variant = inventoryWithoutVariants;
          variantStock = variant.stock_quantity;
        }
      }

      if (variantStock < quantity) {
        return handleResponse(422, "Product is out of stock", {}, res);
      }

      let cart = await Cart.findOne(
        user_id ? { user_id: user_id } : { guest_user: req.device_id }
      );

      if (!cart) {
        cart = await Cart.create({
          user_id: user_id ? user_id : null,
          guest_user: user_id ? null : req.device_id,
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
        user_id: user_id ? user_id : null,
        guest_user: user_id ? null : req.device_id,
        type: product.has_variant ? variant.modelType : variant.item.itemType,
        discount_percent: variant.discount_percent,
      });


      if (cart) {
        const vendorCartItems = await CartItem.find({ cart_id: cart.id });
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




  static RemoveCart = async (req, res) => {
    const id = req.params.id;
    try {
      const cartItem = await CartItem.findOne({ id });

      if (!cartItem) {
        return handleResponse(
          404,
          "Cart Item Not Found! , Please try again",
          {},
          res
        );
      }

      const cart = await Cart.findOne({ id: cartItem.cart_id });

      if (cart) {
        cart.sub_total -= cartItem.purchase_price;
        cart.item_count -= 1;
        cart.discount_amount -= cartItem.selling_price;
        cart.total_amount -= cartItem.total;
        await cart.save();
      }

      await cartItem.deleteOne();

      const remainingCartItems = await CartItem.find({ cart_id: cart.id });

      if (remainingCartItems.length === 0) {
        await cart.deleteOne();
      }

      return handleResponse(200, "Cart Item deleted successfully", {}, res);
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };

  static UpdateQuantity = async (req, res) => {
    try {
      const { cartItem_id, quantity } = req.body;
      const requiredFields = [
        { field: "cartItem_id", value: cartItem_id },
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

      const user_id = req.user ?  req.user.id : null;

      let cart_data;
      if (user_id) {
        cart_data = await CartItem.findOne({  id: cartItem_id,user_id: user_id });
      } else {
        cart_data = await CartItem.findOne({  id: cartItem_id, guest_user: req.headers.device_id });
      }

      if (!cart_data) {
        return handleResponse(404, "Record not found", {}, res);
      }

      let variant;
      if (cart_data.variant_id) {
        variant = await InventoryWithVarient.findOne({
          id: cart_data.variant_id,
        });
      } else {
        variant = await InvertoryWithoutVarient.findOne({
          "item.itemId": cart_data.product_id,
        });
      }

      if (!variant) {
        return handleResponse(404, "Variant not found", {}, res);
      }

      cart_data.quantity = quantity;
      cart_data.total_weight = cart_data.weight * quantity;
      cart_data.selling_price =
        variant.mrp * quantity - variant.selling_price * quantity;
      cart_data.purchase_price = variant.mrp * quantity;
      cart_data.total = variant.selling_price * quantity;
      await cart_data.save();

      const cart = await Cart.findOne({ id: cart_data.cart_id });
      if (cart) {
        const vendorCartItems = await CartItem.find({ cart_id: cart.id });
        cart.item_count = vendorCartItems.length;
        cart.sub_total = vendorCartItems.reduce(
          (sum, item) => sum + item.purchase_price,
          0
        );
        cart.discount_amount = vendorCartItems.reduce(
          (sum, item) => sum + item.selling_price,
          0
        );
        cart.total_amount = vendorCartItems.reduce(
          (sum, item) => sum + item.total,
          0
        );
        await cart.save();
      }

      return handleResponse(200, "Quantity Updated successfully", {}, res);
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };



  static GetCart = async (req, res) => {
    const user = req.user;
    const user_id = user ? user.id : null;

    try {
      let wishlistItems;

      if (user_id) {
        wishlistItems = await Cart.find({ user_id }).lean().sort({ _id: -1 });
      } else {
        wishlistItems = await Cart.find({ guest_user: req.headers.device_id }).lean().sort({ _id: -1 });
      }
  
      if (wishlistItems.length > 0) {
        for (const wishlist of wishlistItems) {
          let productWeight = 0;
          let is_prescription_required = false;
          wishlist.cart_item = await CartItem.find({ cart_id: wishlist.id })
            .sort({ _id: -1 })
            .lean();

            // console.log(wishlist.cart_item);

          for (const item of wishlist.cart_item) {
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
            productWeight += item.total_weight;
            if(product.prescription_required == true){
                 is_prescription_required = true
            }

            if (item.variant_id) {
              item.product.inventoryWithoutVariant =
                await InventoryWithVarient.findOne({
                  id: item.variant_id,
                }).lean();
            } else {
              const inventory_without_variants =
                await InvertoryWithoutVarient.findOne({
                  "item.itemId": item.product_id,
                  "item.itemType": item.type,
                }).lean();
              if (inventory_without_variants) {
                item.product.inventoryWithVariant = inventory_without_variants;
              }
            }

            item.product.shipping_detail = await UserAddress.findOne({
              user_id: item.user_id,
            });
          }

          wishlist.is_prescription_required = is_prescription_required;

          const location = await UserAddress.findOne({
            user_id: wishlist.user_id,
            is_default : true
          });

          if (location) {
            const country = await Country.findOne({ name: location.country });

            const shippingCountry = await ShippingCountry.findOne({
              country_id: country._id,
              states: { $in: location.state },
            });

            if (shippingCountry) {
              const shipping_zone = await ShippingZone.findOne({
                _id: shippingCountry.zone,
                status: true,
              });

              if (shipping_zone) {
                const shipping_rate = await ShippingRate.findOne({
                  zone_id: shipping_zone._id,
                  mini_order: { $lte: productWeight },
                  max_order: { $gte: productWeight },
                }).select("id delivery_takes rate name");

                if (shipping_rate) {
                  wishlist.shipping_charges = shipping_rate;
                  wishlist.is_shipping = true;
                } else {
                  wishlist.shipping_charges =
                    "This product cannot be delivered to selected location";
                  wishlist.is_shipping = false;
                }
              } else {
                wishlist.shipping_charges =
                  "This product cannot be delivered to selected location";
                wishlist.is_shipping = false;
              }
            } else {
              wishlist.shipping_charges =
                "This product cannot be delivered to selected location";
              wishlist.is_shipping = false;
            }
          } else {
            wishlist.shipping_charges = "shipping address not found";
            wishlist.is_shipping = false;
          }
        }

        return handleResponse(
          200,
          "Cart fetched successfully",
          wishlistItems,
          res
        );
      } else {
        return handleResponse(200, "Cart is empty", {}, res);
      }
    } catch (e) {
      return handleResponse(500, e.message, {}, res);
    }
  };
}

export default CartController;
