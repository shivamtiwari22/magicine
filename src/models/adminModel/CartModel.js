import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const CartSchema = mongoose.Schema(
  {
    id: Number,
    user_id: {
      type: Number,
      default: null,
    },
    guest_user: {
      type: String,
      default: null,
    },
    shipping_id: {
      type: Number,
      default: null,
    },
    item_count: {
      type: Number,
      default: null,
    },
    coupon_code: {
      type: String,
      default: null,
    },

    coupon_type: {
      type: String,
      default: null,
    },

    discount_amount: {
      type: Number,
      default: null,
    },

    shipping_charges: {
      type: Number,
      default: null,
    },

    coupon_discount: {
      type: Number,
      default: null,
    },

    tax_amount: {
      type: Number,
      default: null,
    },

    sub_total: {
      type: Number,
      default: null,
    },

    total_amount: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

CartSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
CartSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

CartSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Cart");
  }
  next();
});

async function getNextSequenceValue(modelName) {
  let sequence = await SequenceModel.findOneAndUpdate(
    { modelName: modelName },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, new: true }
  );
  return sequence.sequenceValue;
}

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;
