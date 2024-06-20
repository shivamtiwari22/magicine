import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const CartSchema = mongoose.Schema(
  {
    id: Number,
    cart_id: {
      type: Number,
      default: null,
    },
      user_id: {
      type: Number,
      default: null,
    },
    guest_user: {
      type: String,
      default: null,
    },
    product_id: {
      type: Number,
      default: null,
    },

    variant_id: {
      type: Number,
      default: null,
    },
    quantity: {
      type: Number,
      default: null,
    },

    type: {
      type: String,
      default: null,
    },

    name: {
      type: String,
      default: null,
    },

    weight: {
      type: Number,
      default: null,
    },

    total_weight: {
      type: Number,
      default: null,
    },

    single_mrp: {
      type: Number,
      default: null,
    },

    
    purchase_price: {
      type: Number,
      default: null,
    },
    
    selling_price: {
      type: Number,
      default: null,
    },
    
    discount_percent: {
      type: Number,
      default: null,
    },

    total: {
      type: Number,
      default: null,
    }
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

const CartItem = mongoose.model("Cart", CartSchema);
export default CartItem ;
