import mongoose from "mongoose";
import SequenceModel from "../sequence.js";
import moment from "moment";

const OrderSchema = mongoose.Schema(
  {
    id: Number,
    user_id: {
      type: Number,
      default: null,
    },
    invoice_number: {
      type: Number,
      default: null,
    },
    order_number: {
      type: Number,
      default: null,
    },
    shipping_id: {
      type: Number,
      default: null,
    },
    shipping_rate_id : {
       type:Number ,
       default:null
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

    shipping_amount: {
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

    status: {
      type: String,
      default: 'pending',
    },
    payment_method: {
      type: String,
      default: null,
    },
    transaction_id: {
      type: String,
      default: null,
    },
    currency: {
      type: String,
      default: null,
    },
    remarks: {
      type: String,
      default: null,
    },
    payment_status: {
      type: String,
      default: null,
    },
    paid_at: {
      type: Date,
      default: null,
    },
    refund_amount: {
      type: Number,
      default: null,
    },
    prescription : {
        type:Boolean ,
        default: false
    }
  },
  {
    timestamps: {},
    retainNullValues: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

OrderSchema.path("createdAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});
OrderSchema.path("updatedAt").get(function (value) {
  return value ? moment(value).format("DD-MM-YYYY") : null;
});

OrderSchema.pre("save", async function (next) {
  if (!this.id) {
    this.id = await getNextSequenceValue("Order");
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

const Order = mongoose.model("Order", OrderSchema);
export default Order;
